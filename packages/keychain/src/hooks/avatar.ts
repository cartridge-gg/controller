import { useCallback, useEffect, useState } from "react";
import { cairo, num, RpcProvider } from "starknet";
import { CONTRACT_AVATAR } from "@cartridge/controller/src/constants";
import dataUriToBuffer from "data-uri-to-buffer";

import Storage from "../utils/storage";

const SCALE = 10;
const PADDING = 0;
const MAX_ROWS = 14;
const MAX_COLS = 7;
const MIN_DIMENSION = 8;
const MAX_DIMENSION = 8; // Restrict till new contract is deployed

enum CellType {
  EMPTY,
  BASE,
  BORDER,
}

export type AvatarData = {
  svg: string;
};

export type AttributeData = {
  baseColor: string;
  borderColor: string;
  backgroundColor: string;
  dimension: number;
  fingerprint: string;
};

type CacheStore = {
  [address: string]: {
    points: number;
  } & AttributeData;
};

export const useAvatar = (
  address: string,
  points: number,
): {
  loading: boolean;
  error?: Error;
  evolved: boolean;
  avatars: AvatarData[];
  current?: AvatarData;
  refresh: () => void;
} => {
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(true);
  const [avatars, setAvatars] = useState<AvatarData[]>([]);
  const [current, setCurrent] = useState<AvatarData>();
  const [evolved, setEvolved] = useState<boolean>(false);

  const fetch = useCallback(() => {
    callContract(address)
      .then((data) => {
        let cache: CacheStore = Storage.get("avatars") || {};
        cache[address] = { ...data, points };
        Storage.set("avatars", cache);

        const avatars = parseAvatars(data);
        setAvatars(avatars);
        setCurrent(avatars[avatars.length - 1]);
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, [address, points]);

  useEffect(() => {
    if (address && points) {
      const cache: CacheStore = Storage.get("avatars") || {};
      if (cache[address]) {
        if (!cache[address].points || points > cache[address].points) {
          setEvolved(true);
          fetch();
          return;
        }
        const avatars = parseAvatars(cache[address]);
        setAvatars(avatars);
        setCurrent(avatars[avatars.length - 1]);
        setLoading(false);
        return;
      }
      fetch();
    }
  }, [address, points, fetch]);

  return {
    error: error,
    loading: loading,
    evolved: evolved,
    avatars: avatars,
    current: current,
    refresh: fetch,
  };
};

export const parseAvatars = (data: AttributeData): AvatarData[] => {
  const avatars: AvatarData[] = [];
  for (let i = MIN_DIMENSION; i <= MAX_DIMENSION; i += 2) {
    const svg = data2Svg({ ...data, crop: i });
    avatars.push({ svg });
  }
  return avatars;
};

export const callContract = async (address: string): Promise<AttributeData> => {
  const tokenId = cairo.uint256(address);

  const provider = new RpcProvider({
    nodeUrl: process.env.NEXT_PUBLIC_RPC_GOERLI,
  });

  let res = await provider.callContract({
    contractAddress: CONTRACT_AVATAR,
    entrypoint: "tokenURI",
    calldata: [cairo.felt(tokenId.low), cairo.felt(tokenId.high)],
  });

  res.result.shift();
  const data = res.result.map((felt) =>
    Buffer.from(felt.substring(2), "hex").toString(),
  );

  const decodedUri = dataUriToBuffer(data.join(""));
  const json = JSON.parse(decodedUri.toString());

  const baseColor = findValue(json.attributes, "Base Color");
  const borderColor = findValue(json.attributes, "Border Color");
  const backgroundColor = findValue(json.attributes, "Background Color");
  const dimension = parseInt(findValue(json.attributes, "Dimension"));
  const fingerprint = num.toHex(
    BigInt(findValue(json.attributes, "Fingerprint")),
  );

  return {
    baseColor,
    borderColor,
    backgroundColor,
    dimension,
    fingerprint,
  };
};

const findValue = (
  attr: Array<{ trait_type: string; value: string }>,
  trait: string,
) => {
  return (
    attr.find((a) => {
      return a.trait_type === trait;
    })?.value || ""
  );
};

const data2Svg = ({
  baseColor,
  borderColor,
  dimension,
  fingerprint,
  crop,
}: { crop: number } & AttributeData): string => {
  const grid = new Array(MAX_ROWS * MAX_COLS).fill(CellType.EMPTY);
  fingerprint
    .substring(2)
    .split("")
    .reverse()
    .forEach((char, charIdx) => {
      const cellIdx = charIdx * 4;
      const num = parseInt(char, 16);
      for (let i = 0; i < 4; i++) {
        if (num & (1 << i)) {
          grid[cellIdx + i] = CellType.BASE;
        }
      }
    });

  grid.forEach((_, idx) => {
    // crop y
    const mask = MAX_COLS - crop / 2;
    if (idx < mask * MAX_COLS || idx > (mask + crop) * MAX_COLS) {
      grid[idx] = CellType.EMPTY;
      return;
    }

    // crop x
    const rem = idx % MAX_COLS;
    if (rem < MAX_COLS - crop / 2) {
      grid[idx] = CellType.EMPTY;
      return;
    }
  });

  // add border
  grid.forEach((cell, idx) => {
    if (cell == CellType.EMPTY) {
      const above = grid[idx - MAX_COLS];
      const below = grid[idx + MAX_COLS];

      const rem = idx % MAX_COLS;
      const left = rem != 0 ? grid[idx - 1] : CellType.EMPTY;
      const right = rem != MAX_COLS - 1 ? grid[idx + 1] : CellType.EMPTY;

      if (
        above == CellType.BASE ||
        below == CellType.BASE ||
        right == CellType.BASE ||
        left == CellType.BASE
      ) {
        grid[idx] = CellType.BORDER;
      }
    }
  });

  // render
  let rects: Array<string> = [];
  grid.forEach((cell, idx) => {
    if (cell != CellType.EMPTY) {
      const x = idx % MAX_COLS;
      const y = Math.floor(idx / MAX_COLS);
      const mirror_x = MAX_ROWS - x - 1;
      //const fill = cell == CellType.BASE ? baseColor : borderColor; // Uncomment after new contract deployed
      const fill = cell == CellType.BASE ? baseColor : "rgba(255,255,255,0.08)";
      rects.push(
        `<rect x="${x + PADDING}" y="${
          y + PADDING
        }" width="1" height="1" fill="${fill}"/>`,
      );
      rects.push(
        `<rect x="${mirror_x + PADDING}" y="${
          y + PADDING
        }" width="1" height="1" fill="${fill}"/>`,
      );
    }
  });

  return svg(rects);

  function svg(rects: string[]) {
    const zoomPoint = (MAX_ROWS - crop - 2) / 2;
    const zoomSize = crop + 2;
    const viewBox = `${zoomPoint} ${zoomPoint} ${zoomSize} ${zoomSize}`;
    const header = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" shape-rendering="crispEdges">`;
    const closer = `</svg>`;
    return `${header}${rects.join("")}${closer}`;
  }
};
