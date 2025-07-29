import { GraphQLClient } from "graphql-request";
import { fetchDataCreator } from "@cartridge/ui/utils";

export const ENDPOINT = `${process.env.EXPO_PUBLIC_CARTRIDGE_API_URL}/query`;

export const client = new GraphQLClient(ENDPOINT, { credentials: "include" });

export const fetchData = fetchDataCreator(ENDPOINT);
