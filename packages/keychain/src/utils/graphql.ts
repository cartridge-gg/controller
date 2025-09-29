import {
  GraphQLClient,
  type RequestDocument,
  type Variables,
} from "graphql-request";
import { fetchDataCreator } from "@cartridge/ui/utils";
import { parseClientError, type ErrorWithGraphQL } from "./errors";

export const ENDPOINT = `${import.meta.env.VITE_CARTRIDGE_API_URL}/query`;

export const client = new GraphQLClient(ENDPOINT, { credentials: "include" });

export const fetchData = fetchDataCreator(ENDPOINT);

/**
 * Wrapper for GraphQL requests that handles RPC errors wrapped in GraphQL errors.
 * Use this for operations that interact with backend services that may return RPC errors.
 *
 * @param document - The GraphQL document to execute
 * @param variables - Optional variables for the query/mutation
 * @returns The data from the GraphQL response
 * @throws ErrorWithGraphQL if an RPC error is detected, or the original error otherwise
 */
export async function request<
  TData = unknown,
  TVariables extends Variables = Variables,
>(document: RequestDocument, variables?: TVariables): Promise<TData> {
  try {
    // @ts-expect-error - graphql-request types are complex, but this works
    return await client.request<TData, TVariables>(document, variables);
  } catch (err) {
    // Parse GraphQL errors that contain RPC errors
    const parsedError = parseClientError(err);
    if (parsedError) {
      const error = new Error(parsedError.summary) as ErrorWithGraphQL;
      error.graphqlError = parsedError;
      throw error;
    }
    // If not a wrapped RPC error, throw the original error
    throw err;
  }
}
