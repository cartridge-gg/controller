import { GraphQLClient } from "graphql-request";

export const ENDPOINT = `${process.env.NEXT_PUBLIC_CARTRIDGE_API_URL}/query`;

export const client = new GraphQLClient(ENDPOINT, { credentials: "include" });
