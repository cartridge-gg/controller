export function useCollections() {
  return {
    collections: Object.values(collections),
    status: "success",
  };
}

export function useCollection() {
  return {
    collection: collections.collection1,
    status: "success",
  };
}

const collections = {
  collection1: {
    address:
      "0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1",
    name: "Blobert",
    type: "ERC-721",
    imageUrl:
      "https://media.arkproject.dev/contracts/0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1/avatar.jpg",
    totalCount: 100,
  },
};
