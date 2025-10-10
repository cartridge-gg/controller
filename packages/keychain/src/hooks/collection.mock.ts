import { fn, Mock } from "@storybook/test";
import { UseCollectionsResponse, UseCollectionResponse } from "./collection";

export * from "./collection";

const collections = {
  collection1: {
    address:
      "0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1",
    name: "Blobert",
    type: "ERC-721",
    imageUrls: [
      "https://media.arkproject.dev/contracts/0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1/avatar.jpg",
    ],
    totalCount: 100,
  },
};

const assets = [
  {
    tokenId: "8",
    name: "Tarbert",
    description:
      "A rare Tarbert NFT from the Blobert collection. Tarbert is known for his distinctive red color and friendly smile. This NFT grants special access to the Blobert community.",
    imageUrls: [
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHN0eWxlPSJpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZCIgdmlld0JveD0iMCAwIDM1MCAzNTAiPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdDQU1BQUFCZzNBbTFBQUFBUWxCTVZFWEdlU2VnSVViNk1sWU9GQjRmTGpoaEpFVHI3ZXhBTEZNVkhTdU9UeWw4TFRtdU95K210TFBhdDVGK1RUL2tuejdGbG5HMWUxYnR3RzAySGlaUEx6RmxNU3Zwb3lwREFBQUJYMGxFUVZSSXgrM1R5M0xDTUF5Rlljc0g0VXRLUXFCOS8xZXRGQWt3MENUZWROV2VocFFaL20rOElJVC8yZURyem1PTUZHVjlCTnE2aUIwQ3JHRy9BRk0zOE43Q2d5eGpYNENJUEhlQnZRTlU1TU50S3ZhQjlOMkFISHdjcGRZN05nSFlnSlJIRVhyUEhTQmI2bmY2SFhDUTB1NTlvSm1DVGZFS1NNQ3VlQUxZL0lrQVlDRnRid0xwY3BtbWRKN3g5cjBwNFp5ejVzd2dXZ1F1U1RhZG5nSElKb0o4VWY2QUJReFZ3TGtGV0I3VUpXTTNVWUVJQWNNd1ZBZHR2NGlvb1JMdDVRV0Nndm9LckljQkZmRU81aE5xSFliUUFvemt2WFZrQitnRVlKSyt2b0JaUGdZYjhKZURjY1NVYWszbE5MY0FNMm0vUk9TWEFZd0lTVmJPOHVZaEFPMGROQWNRWkNtRVV0TDRpZmNIdzRVZFlHRDEwUURkUVhPQWdMVTVzRml2ZnRBZXdCdUEyWVdaRHVDQ2IwRGZyd093emdDeDVjVHJBT3dqTm1QNUNnRHVQWnF0QW5DVGY1VWlEYTdYcTZrZndXUEY3cmQvSmVnVi92aStBV3RoRHBCUjYzelRBQUFBQUVsRlRrU3VRbUNDIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzUwcHgiIGhlaWdodD0iMzUwcHgiIC8+PC9zdmc+",
    ],
    attributes: [
      {
        trait_type: "Rarity",
        value: "Rare",
      },
      {
        trait_type: "Color",
        value: "Red",
      },
      {
        trait_type: "Personality",
        value: "Friendly",
      },
    ],
    owner:
      "0x1234567890123456789012345678901234567890123456789012345678901234567890",
  },
];

export const useCollections: Mock<() => UseCollectionsResponse> = fn(() => ({
  collections: Object.values(collections),
  status: "success" as const,
  refetch: fn().mockName("refetch"),
})).mockName("useCollections");

export const useCollection: Mock<() => UseCollectionResponse> = fn(() => ({
  collection: collections.collection1,
  assets,
  status: "success" as const,
  refetch: fn().mockName("refetch"),
})).mockName("useCollection");
