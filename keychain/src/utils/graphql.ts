import { GraphQLClient } from "graphql-request";

export const ENDPOINT = process.env.NEXT_PUBLIC_API_URL;

export const client = new GraphQLClient(ENDPOINT, { credentials: "include" });
