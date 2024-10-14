import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyAddress,
  SpinnerIcon,
} from "@cartridge/ui-next";
import { ERC20, ERC20Info } from "@cartridge/utils";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { useConnection } from "./provider/hooks";
// import { Navigation } from "./navigation";
import { useEffect, useState } from "react";

export function Inventory() {
  const { username, address, provider, erc20: erc20Params } = useConnection();
  const [erc20s, setErc20s] = useState<ERC20Info[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setupErc20Info();

    async function setupErc20Info() {
      const res = await Promise.allSettled(
        erc20Params.map((t) =>
          new ERC20({
            address: t.address,
            provider,
            logoUrl: t.logoUrl,
          }).info(),
        ),
      );

      setErc20s(
        res.filter((res) => res.status === "fulfilled").map((res) => res.value),
      );
    }
  }, [erc20Params, provider]);

  useEffect(() => {
    const id = setInterval(updateBalance, 3000);

    async function updateBalance() {
      setIsFetching(true);

      const tokens = await Promise.all(
        erc20s.map(async (t) => {
          try {
            return {
              ...t,
              balance: await t.class.balanceOf(address),
            };
          } catch (e) {
            return { ...t, error: e as Error };
          }
        }),
      );

      setErc20s(tokens);
      setIsFetching(false);
    }

    return () => {
      clearInterval(id);
    };
  }, [address, erc20s, provider]);

  const collections = [
    {
      contractAddress:
        "0x04645f67e3e195420b2b4e63742153623e50c143ed8b89c91e3fb908fe87b168",
      name: "Golden Tokens",
      totalCount: 2,
      imageUrl: `data:image/svg+xml;utf8,<svg width="100% " height="100% " viewBox="0 0 20000 20000" xmlns="http://www.w3.org/2000/svg"><style>svg{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAFABAMAAAA/vriZAAAAD1BMVEUAAAD4+ACJSQL/pAD///806TM9AAACgUlEQVR4AWKgGAjiBUqoANDOHdzGDcRQAK3BLaSFtJD+awriQwh8zDd2srlQfjxJGGr4xhfCsuj3ywEC7gcCAgKeCD9bVC8gICAg4HcDVtGvP/G5MKIXvKF8MhAQEBAQMFiformK+Iho8uh8zwMCAgICAk65aouaEVM9WL3zAQICAgJuBqYtth7brEZHC2CcMI6Z1FQCAgICAm4GTnZsGL8WRaW4inPVV3eAgICAgI8CVls0uIr+WnnR7wABAQEBFwAvbBn3ytrvuhIQEBAQcCvwa8IbygCmDRAQEBBwK7DbTt8A/OdWl7ZUAgICAgLuAp5slXD1+i2BzQYICAgIuBsYtigyf82Z+GjRkhMYNQABAQEBdwFfsVXgRLd1YDl/yAEBAQEB9wDrO7OoOQtRvdpeGKecAAQEBATcCsxWd7qNwh1YItG15EYgICAgIOAopyudHp6FuApgTRlgKbkTCAgICAg4jhAl8NCz/u31W2+na4GAgICAgHFVh+ZPtkmJvEiuNeYMa4CAgICAgPlxWSxPnERhS0zE4XDR78rAyw4gICAgIGASYteUN1soJyV+CGOL7QEBAQEBnwTs20yl+tVZvFGLhTpUsxAICAgICJjKfORvvD06OcAL2zogICAgIODJFg+fvknL25vR+7ndCQQEBAQELMrYIeQ/XoxJvrItBAICAgICpvK0w2l8pUak3Nn2AwEBAQEB6z+sj/1jin/yTlsFdT8QEBAQELAro1PF/lEpIlJGHgthAwQEBATcD8wI5dxOzRr1C7POAgQEBAR8GjA7X1SqyjqxP0/cAJYDAQEBAQGDGt46cJ/JyQIEBAQEfD7w0nsl2g8EBAQEBPwNOZbOIEJQph0AAAAASUVORK5CYII=);background-repeat:no-repeat;background-size:contain;background-position:center;image-rendering:-webkit-optimize-contrast;-ms-interpolation-mode:nearest-neighbor;image-rendering:-moz-crisp-edges;image-rendering:pixelated;}</style></svg>`,
    },
    {
      contractAddress:
        "0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1",
      name: "Blobert",
      totalCount: 9,
      imageUrl: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHN0eWxlPSJpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZCIgdmlld0JveD0iMCAwIDM1MCAzNTAiPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdBUU1BQUFCdHpHdkVBQUFBQmxCTVZFWEdlU2VPVHlsMUNheHpBQUFBRTBsRVFWUVkwMk1ZQlVTQjZQLy9NNGhSQndCclF3TENnQ1d2RmdBQUFBQkpSVTVFcmtKZ2dnPT0iIHg9IjAiIHk9IjAiIHdpZHRoPSIzNTBweCIgaGVpZ2h0PSIzNTBweCIgLz48aW1hZ2UgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFEQUFBQUF3QkFNQUFBQ2xMT1MwQUFBQUcxQk1WRVVBQUFBZkxqaWdJVWI2TWxZT0ZCNWhKRVRyN2V3VkhTdW10TE52azVVQUFBQUFBWFJTVGxNQVFPYllaZ0FBQUtsSlJFRlVPTXZ0emI4S3dqQVF4L0ViNmdPYytLZWpYZ1YzcitCYW1tU1hhQjRnUy9laTRCdjB1VDBxTHNsMWNCUHNsMDczNGRmQWIxUllheHZ0YnJqaVdwR1crY1JjNTRNcnMwdzRtN2hLaDhMTEVmSEJkUXBVeVIyM0pnVkhkRVpweFUwR3ZRcXRRQm14aktaSjNoWVlPaHk2ZXdaSEhHSDVEV3lpZkJxTUpRRHVBeVNRVE41d2dDVG45OXFmWk9MQ3M4ZjFEZktDSjZJZGFCS0lRRzBSWUtKSnVNRGNIL1FDTGlVbHg3WEhkOW9BQUFBQVNVVk9SSzVDWUlJPSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdDQU1BQUFCZzNBbTFBQUFBTmxCTVZFVUFBQUFPRkI2dU95OThMVGtsR0NsK1RUOURJakMxZTFaK2xaZkd6YzdaWWpucjdleFBMekhhdDVFMkhpWlViM21PVHlsbE1TdEZMT3U1QUFBQUFYUlNUbE1BUU9iWVpnQUFBT05KUkVGVVNNZnQwZUVTQVNFVWhtR25VMGN0RnZkL3M5NnlqVVhKQmZUNHNTYmZPekVPMHpSTkd4RnBuYUt6MTZKMUtMMjl5OTRQWTdjUTlraUw3UTZkVTVMWURzUWxYc3ZpdmF2enJIOURrQVhzSThtT29CMGNKVFAxSU5FdENIeHkrV3JZaHlNa21ITWt5ZnN0MEJ5VTVqTmdIdVJNd0lnRXp6MEJHb0dVZlFpbXFtWldiakVMQkxuZzhzWS9lczVCL1Nva0tFSDNkN01uVU1OMlN5Umgyc0hWOVFhOVhtTk1KUGdSZUJnUWVaTTgrZ0hrUFRnTjlnU21jRms2Z2FjcXdiaW90T3lIUlUxMHZLY2dlUkgyUTdJelhrUHV0NXZ3V05mMXp5Q3JqNmw0QU1VcUJ6bDdoZzg5QUFBQUFFbEZUa1N1UW1DQyIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdBZ01BQUFBcWJCRVVBQUFBQ1ZCTVZFVUFBQURyN2V5bXRMTzhPVmMzQUFBQUFYUlNUbE1BUU9iWVpnQUFBQkZKUkVGVUtNOWpHQVVEQmhJWVJoNEFBRjN3QUdHYmhCSEhBQUFBQUVsRlRrU3VRbUNDIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzUwcHgiIGhlaWdodD0iMzUwcHgiIC8+PGltYWdlIGhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0JBTUFBQUNsTE9TMEFBQUFGVkJNVkVVQUFBQU9GQjdIUndCRElqQjhMVG0yZmxxdU95OUFmQ2lsQUFBQUFYUlNUbE1BUU9iWVpnQUFBSDlKUkVGVU9Ndk5rVUVLZ0NBUVJhY2JPRUx0L1RjSUwxRFlCZW9FUWQzL0RLRkNtM0VpUWFpMzlQSDhpNkhYY0VhOGQzTmlNY0wwQ1NhQjNTSnJRVGdBMWpVUnNIQm9JemhTTEJ3c21vZ09ZTUJRS2VFY3lJUlRJTGtYWkdJVXdacndtZ2kxWHczbnFCVzFHNlNPVDZTSXZWb2M1bzhpTkN0MDRSOU8rekVYQ0tnV2xNY2FCVVlBQUFBQVNVVk9SSzVDWUlJPSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1MHB4IiBoZWlnaHQ9IjM1MHB4IiAvPjwvc3ZnPg==`,
    },
    {
      contractAddress:
        "0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809",
      name: "Realms (for Adventurers)",
      totalCount: 82,
      imageUrl: `https://dweb.link/ipfs/QmdSkywfQoETWHxhjWVCym3i5c5azuxqvSPJKwr3ZAw9VB`,
    },
    {
      contractAddress:
        "0x0158160018d590d93528995b340260e65aedd76d28a686e9daa5c4e8fad0c5dd",
      name: "Loot Survivor: Beasts",
      totalCount: 8,
    },
  ];

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        // right={<Navigation />}
      />

      <LayoutContent className="pb-4">
        <Card>
          <CardHeader className="h-10 flex flex-row items-center justify-between">
            <CardTitle>Token</CardTitle>
            {isFetching && <SpinnerIcon className="animate-spin" />}
          </CardHeader>
          {erc20s.map((t, i) => (
            <CardContent
              key={t.address + i}
              className="flex gap-x-1.5 items-center"
            >
              <img src={t.logoUrl} className="w-5 h-5" />
              <div>
                {t.balance === undefined ? "---" : t.balance.toString()}{" "}
                {t.symbol}
              </div>
            </CardContent>
          ))}
        </Card>

        <div className="grid grid-cols-2 gap-2 place-items-center">
          {collections.map((c) => (
            <Card
              key={c.contractAddress}
              className="w-full aspect-square hover:cursor-pointer"
              onClick={() => {
                console.log("Clicked");
              }}
            >
              <CardHeader className="flex flex-row gap-1">
                <div className="truncate flex-1 uppercase text-sm text-bold">
                  {c.name}
                </div>
                <div className="truncate rounded-full min-w-5 h-5 flex place-content-center text-sm text-bold bg-accent px-1.5">
                  {c.totalCount}
                </div>
              </CardHeader>

              {c.imageUrl ? (
                <CardContent
                  className="bg-cover bg-center flex py-4 h-full place-content-center"
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${c.imageUrl})`,
                  }}
                >
                  <div
                    className="h-full aspect-square bg-cover bg-center"
                    style={{ backgroundImage: `url(${c.imageUrl})` }}
                  />
                </CardContent>
              ) : (
                <CardContent className="h-full place-content-center text-center">
                  No image available
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </LayoutContent>
    </LayoutContainer>
  );
}
