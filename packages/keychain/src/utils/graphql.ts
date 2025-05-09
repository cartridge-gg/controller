import { GraphQLClient } from "graphql-request";
import { fetchDataCreator } from "@cartridge/ui/utils";

export const ENDPOINT = `${import.meta.env.VITE_CARTRIDGE_API_URL}/query`;

export const client = new GraphQLClient(ENDPOINT, { credentials: "include" });

export const fetchData = fetchDataCreator(ENDPOINT);
