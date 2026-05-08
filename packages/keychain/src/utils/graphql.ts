import {
  GraphQLClient,
  type RequestDocument,
  type Variables,
} from "graphql-request";
import { fetchDataCreator } from "@cartridge/controller-ui/utils";
import { parseClientError, type ErrorWithGraphQL } from "./errors";
import { getBearerToken } from "./bearer-token";

export const ENDPOINT = `${import.meta.env.VITE_CARTRIDGE_API_URL}/query`;

// Read fresh per request — bearer token can appear/change after popup login
// without anything calling fetchDataCreator/GraphQLClient again.
function authHeader(): Record<string, string> {
  const token = getBearerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const client = new GraphQLClient(ENDPOINT, {
  credentials: "include",
  requestMiddleware: (req) => ({
    ...req,
    headers: { ...req.headers, ...authHeader() },
  }),
});

const baseFetchData = fetchDataCreator(ENDPOINT);
export async function fetchData<TData, TVariables>(
  query: string,
  variables?: TVariables,
  signal?: AbortSignal,
): Promise<TData> {
  const headers = authHeader();
  if (Object.keys(headers).length === 0) {
    return baseFetchData<TData, TVariables>(query, variables, signal);
  }
  // Build a fresh fetcher with the current bearer; cheap, captures token at call time.
  return fetchDataCreator(ENDPOINT, { headers })<TData, TVariables>(
    query,
    variables,
    signal,
  );
}

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
