import { useMemo } from "react";
import type {
  AccountSearchResult,
  UseAccountSearchOptions,
  UseAccountSearchResult,
} from "./useAccountSearch";

// Mock data for Storybook
const mockAccounts = [
  {
    username: "shints",
    points: 20800,
    lastOnline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    username: "shinobi",
    points: 20800,
    lastOnline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    username: "shinex",
    points: 15200,
    lastOnline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    username: "shiny",
    points: 8900,
    lastOnline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
];

export function useAccountSearch(
  query: string,
  options: UseAccountSearchOptions = {},
): UseAccountSearchResult {
  const { minLength = 1, maxResults = 5 } = options;

  const trimmedQuery = query.trim().toLowerCase();
  const shouldSearch = trimmedQuery.length >= minLength;

  const results = useMemo(() => {
    if (!shouldSearch) return [];

    const accountResults: AccountSearchResult[] = [];

    // Filter mock accounts that match the query
    const matchingAccounts = mockAccounts
      .filter((account) =>
        account.username.toLowerCase().startsWith(trimmedQuery),
      )
      .slice(0, maxResults);

    // Add existing accounts from mock data
    accountResults.push(
      ...matchingAccounts.map((account) => ({
        id: `existing-${account.username}`,
        type: "existing" as const,
        username: account.username,
        points: account.points,
        lastOnline: account.lastOnline,
      })),
    );

    // Check if exact match exists
    const exactMatch = accountResults.find(
      (result) => result.username.toLowerCase() === trimmedQuery.toLowerCase(),
    );

    // If no exact match, add "Create New" option
    if (!exactMatch && trimmedQuery.length >= 3) {
      accountResults.unshift({
        id: `create-new-${trimmedQuery}`,
        type: "create-new",
        username: trimmedQuery,
      });
    }

    return accountResults;
  }, [trimmedQuery, shouldSearch, maxResults]);

  // Simulate loading state briefly
  const isLoading = false;

  return {
    results,
    isLoading,
    error: undefined,
  };
}
