import { useQuery, UseQueryOptions } from 'react-query';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

function fetcher<TData, TVariables>(endpoint: string, requestInit: RequestInit, query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      ...requestInit,
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  }
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Erc__Token = {
  __typename?: 'ERC__Token';
  contract_address?: Maybe<Scalars['String']>;
  decimals?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  symbol?: Maybe<Scalars['String']>;
  token_id?: Maybe<Scalars['String']>;
};

export type Erc__Transfer = {
  __typename?: 'ERC__Transfer';
  amount?: Maybe<Scalars['String']>;
  executed_at?: Maybe<Scalars['String']>;
  from?: Maybe<Scalars['String']>;
  to?: Maybe<Scalars['String']>;
  token_metadata?: Maybe<Erc__Token>;
  type?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  ercTransfer?: Maybe<Array<Erc__Transfer>>;
};


export type QueryErcTransferArgs = {
  accountAddress: Scalars['String'];
  limit: Scalars['Int'];
};

export type TransferQueryVariables = Exact<{
  address: Scalars['String'];
  limit: Scalars['Int'];
}>;


export type TransferQuery = { __typename?: 'Query', ercTransfer?: Array<{ __typename?: 'ERC__Transfer', amount?: string | null, from?: string | null, to?: string | null, type?: string | null, executed_at?: string | null, token_metadata?: { __typename?: 'ERC__Token', contract_address?: string | null, decimals?: string | null, name?: string | null, symbol?: string | null, token_id?: string | null } | null }> | null };


export const TransferDocument = `
    query Transfer($address: String!, $limit: Int!) {
  ercTransfer(accountAddress: $address, limit: $limit) {
    amount
    from
    to
    token_metadata {
      contract_address
      decimals
      name
      symbol
      token_id
    }
    type
    executed_at
  }
}
    `;
export const useTransferQuery = <
      TData = TransferQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: TransferQueryVariables,
      options?: UseQueryOptions<TransferQuery, TError, TData>
    ) =>
    useQuery<TransferQuery, TError, TData>(
      ['Transfer', variables],
      fetcher<TransferQuery, TransferQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, TransferDocument, variables),
      options
    );