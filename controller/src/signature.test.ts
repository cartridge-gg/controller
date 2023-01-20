import { hash, SequencerProvider, number } from "starknet";
import { verifyMessageHash } from "./utils";

const message = {
  types: {
    StarkNetDomain: [
      {
        name: "name",
        type: "felt",
      },
      {
        name: "version",
        type: "felt",
      },
      {
        name: "chainId",
        type: "felt",
      },
    ],
    Person: [
      {
        name: "name",
        type: "felt",
      },
      {
        name: "wallet",
        type: "felt",
      },
    ],
    Mail: [
      {
        name: "from",
        type: "Person",
      },
      {
        name: "to",
        type: "Person",
      },
      {
        name: "contents",
        type: "felt",
      },
    ],
  },
  primaryType: "Mail",
  domain: {
    name: "StarkNet Mail",
    version: "1",
    chainId: 1,
  },
  message: {
    from: {
      name: "Cow",
      wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
    },
    to: {
      name: "Bob",
      wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    },
    contents: "Hello, Bob!",
  },
};

describe("Signature", () => {
  let provider: SequencerProvider;
  beforeAll(() => {
    provider = new SequencerProvider({
      network: "goerli-alpha",
    });
  });

  describe("verifyMessageHash", () => {
    it("verification should succeed", async () => {
      const res = await verifyMessageHash(
        provider,
        "0x00b6b8d137192728db15ebccc9a00479d493eb5b028c3fddf0208e21c9cd60ad",
        hash.starknetKeccak(JSON.stringify(message)),
        [
          "1142507608223244634944010191289670861779930380218430529333188743946932436686",
          "0",
          "65653169130356506801443921",
          "4487245971615170834316746",
          "9170503828228021637363449",
          "22615520984280348969116991",
          "43191839249617001288546850",
          "8553552113352936060200013",
          "9",
          "0",
          "70",
          "0",
          "2065855609",
          "1885676090",
          "578250082",
          "1635087464",
          "1848534885",
          "1948396578",
          "1667785068",
          "1818586727",
          "1696741922",
          "1110863705",
          "2002739545",
          "1398228037",
          "1129656903",
          "1752521062",
          "880433786",
          "1766212459",
          "1499935089",
          "1483370345",
          "1329096038",
          "1215721250",
          "740454258",
          "1768384878",
          "574235240",
          "1953788019",
          "976170859",
          "1702454120",
          "1634299437",
          "1734964269",
          "1919249775",
          "1986358885",
          "2020897391",
          "1970563438",
          "1731096690",
          "1702259045",
          "1999528801",
          "1920234089",
          "1684497710",
          "1734812204",
          "576942703",
          "1936936818",
          "1768384878",
          "574256242",
          "1969564706",
          "1869899877",
          "1918856037",
          "2037604195",
          "1634623330",
          "1700749668",
          "1684366431",
          "1751478885",
          "574235236",
          "1864396399",
          "1948279663",
          "1836081522",
          "1696621420",
          "1768255092",
          "1147237473",
          "1246973774",
          "543254369",
          "1768846196",
          "543236212",
          "1701671020",
          "1635018030",
          "542336357",
          "543716468",
          "1886599727",
          "795307887",
          "778529839",
          "2036425296",
          "1702371965",
          "10",
          "3",
          "547978947",
          "4176460842",
          "3389847498",
          "3141667658",
          "164671177",
          "2421450441",
          "2918684036",
          "4202036947",
          "486539264",
          "0",
        ].map((x) => number.toBN(+x).toString())
      );

      expect(res).toBe(true);
    });
  });
});
