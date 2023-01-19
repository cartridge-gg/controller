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
  BigInt: any;
  ChainID: any;
  Cursor: any;
  Felt: any;
  JSON: any;
  Long: any;
  Time: any;
  Upload: any;
};

export type Account = Node & {
  __typename?: 'Account';
  accountStarterPack: AccountStarterPackConnection;
  attestations: AttestationConnection;
  contractAddress?: Maybe<Scalars['String']>;
  contracts: ContractConnection;
  createdAt: Scalars['Time'];
  credential: Credential;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  questProgression: AccountQuestConnection;
  quests: QuestConnection;
  socials?: Maybe<Socials>;
  starterPacks: StarterPackConnection;
  type: AccountType;
  updatedAt: Scalars['Time'];
  version: Scalars['Long'];
};


export type AccountAccountStarterPackArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<AccountStarterPackWhereInput>;
};


export type AccountAttestationsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AttestationOrder>;
  where?: InputMaybe<AttestationWhereInput>;
};


export type AccountContractsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ContractOrder>;
  where?: InputMaybe<ContractWhereInput>;
};


export type AccountQuestProgressionArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AccountQuestOrder>;
  where?: InputMaybe<AccountQuestWhereInput>;
};


export type AccountQuestsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<QuestOrder>;
  where?: InputMaybe<QuestWhereInput>;
};


export type AccountStarterPacksArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StarterPackOrder>;
  where?: InputMaybe<StarterPackWhereInput>;
};

/** A connection to a list of items. */
export type AccountConnection = {
  __typename?: 'AccountConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<AccountEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type AccountEdge = {
  __typename?: 'AccountEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Account>;
};

/** Ordering options for Account connections */
export type AccountOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Accounts. */
  field: AccountOrderField;
};

/** Properties by which Account connections can be ordered. */
export enum AccountOrderField {
  CreatedAt = 'CREATED_AT'
}

export type AccountQuest = Node & {
  __typename?: 'AccountQuest';
  account: Account;
  accountID: Scalars['ID'];
  claimTransaction?: Maybe<Transaction>;
  claimTransactionHash?: Maybe<Scalars['ID']>;
  claimed: Scalars['Boolean'];
  completed: Scalars['Boolean'];
  completedAt?: Maybe<Scalars['Time']>;
  currentProgress?: Maybe<Scalars['BigInt']>;
  id: Scalars['ID'];
  progressMax?: Maybe<Scalars['BigInt']>;
  quest: Quest;
  questID: Scalars['ID'];
};

/** A connection to a list of items. */
export type AccountQuestConnection = {
  __typename?: 'AccountQuestConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<AccountQuestEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type AccountQuestEdge = {
  __typename?: 'AccountQuestEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<AccountQuest>;
};

/** Ordering options for AccountQuest connections */
export type AccountQuestOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order AccountQuests. */
  field: AccountQuestOrderField;
};

/** Properties by which AccountQuest connections can be ordered. */
export enum AccountQuestOrderField {
  CompletedAt = 'COMPLETED_AT'
}

/**
 * AccountQuestWhereInput is used for filtering AccountQuest objects.
 * Input was generated by ent.
 */
export type AccountQuestWhereInput = {
  and?: InputMaybe<Array<AccountQuestWhereInput>>;
  /** completed field predicates */
  completed?: InputMaybe<Scalars['Boolean']>;
  /** completed_at field predicates */
  completedAt?: InputMaybe<Scalars['Time']>;
  completedAtGT?: InputMaybe<Scalars['Time']>;
  completedAtGTE?: InputMaybe<Scalars['Time']>;
  completedAtIn?: InputMaybe<Array<Scalars['Time']>>;
  completedAtIsNil?: InputMaybe<Scalars['Boolean']>;
  completedAtLT?: InputMaybe<Scalars['Time']>;
  completedAtLTE?: InputMaybe<Scalars['Time']>;
  completedAtNEQ?: InputMaybe<Scalars['Time']>;
  completedAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  completedAtNotNil?: InputMaybe<Scalars['Boolean']>;
  completedNEQ?: InputMaybe<Scalars['Boolean']>;
  /** current_progress field predicates */
  currentProgress?: InputMaybe<Scalars['BigInt']>;
  currentProgressGT?: InputMaybe<Scalars['BigInt']>;
  currentProgressGTE?: InputMaybe<Scalars['BigInt']>;
  currentProgressIn?: InputMaybe<Array<Scalars['BigInt']>>;
  currentProgressIsNil?: InputMaybe<Scalars['Boolean']>;
  currentProgressLT?: InputMaybe<Scalars['BigInt']>;
  currentProgressLTE?: InputMaybe<Scalars['BigInt']>;
  currentProgressNEQ?: InputMaybe<Scalars['BigInt']>;
  currentProgressNotIn?: InputMaybe<Array<Scalars['BigInt']>>;
  currentProgressNotNil?: InputMaybe<Scalars['Boolean']>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<AccountQuestWhereInput>;
  or?: InputMaybe<Array<AccountQuestWhereInput>>;
  /** progress_max field predicates */
  progressMax?: InputMaybe<Scalars['BigInt']>;
  progressMaxGT?: InputMaybe<Scalars['BigInt']>;
  progressMaxGTE?: InputMaybe<Scalars['BigInt']>;
  progressMaxIn?: InputMaybe<Array<Scalars['BigInt']>>;
  progressMaxIsNil?: InputMaybe<Scalars['Boolean']>;
  progressMaxLT?: InputMaybe<Scalars['BigInt']>;
  progressMaxLTE?: InputMaybe<Scalars['BigInt']>;
  progressMaxNEQ?: InputMaybe<Scalars['BigInt']>;
  progressMaxNotIn?: InputMaybe<Array<Scalars['BigInt']>>;
  progressMaxNotNil?: InputMaybe<Scalars['Boolean']>;
};

export type AccountStarterPack = Node & {
  __typename?: 'AccountStarterPack';
  account: Account;
  accountID: Scalars['ID'];
  claimTransaction?: Maybe<Transaction>;
  claimTransactionHash?: Maybe<Scalars['ID']>;
  claimed: Scalars['Boolean'];
  id: Scalars['ID'];
  starterPack: StarterPack;
  starterPackID: Scalars['ID'];
};

/** A connection to a list of items. */
export type AccountStarterPackConnection = {
  __typename?: 'AccountStarterPackConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<AccountStarterPackEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type AccountStarterPackEdge = {
  __typename?: 'AccountStarterPackEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<AccountStarterPack>;
};

/**
 * AccountStarterPackWhereInput is used for filtering AccountStarterPack objects.
 * Input was generated by ent.
 */
export type AccountStarterPackWhereInput = {
  and?: InputMaybe<Array<AccountStarterPackWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<AccountStarterPackWhereInput>;
  or?: InputMaybe<Array<AccountStarterPackWhereInput>>;
};

/** AccountType is enum for the field type */
export enum AccountType {
  Discord = 'discord',
  Injected = 'injected',
  Webauthn = 'webauthn'
}

export type AccountUpgrade = {
  __typename?: 'AccountUpgrade';
  implementation: Scalars['ID'];
};

/**
 * AccountWhereInput is used for filtering Account objects.
 * Input was generated by ent.
 */
export type AccountWhereInput = {
  and?: InputMaybe<Array<AccountWhereInput>>;
  /** contract_address field predicates */
  contractAddress?: InputMaybe<Scalars['String']>;
  contractAddressContains?: InputMaybe<Scalars['String']>;
  contractAddressContainsFold?: InputMaybe<Scalars['String']>;
  contractAddressEqualFold?: InputMaybe<Scalars['String']>;
  contractAddressGT?: InputMaybe<Scalars['String']>;
  contractAddressGTE?: InputMaybe<Scalars['String']>;
  contractAddressHasPrefix?: InputMaybe<Scalars['String']>;
  contractAddressHasSuffix?: InputMaybe<Scalars['String']>;
  contractAddressIn?: InputMaybe<Array<Scalars['String']>>;
  contractAddressIsNil?: InputMaybe<Scalars['Boolean']>;
  contractAddressLT?: InputMaybe<Scalars['String']>;
  contractAddressLTE?: InputMaybe<Scalars['String']>;
  contractAddressNEQ?: InputMaybe<Scalars['String']>;
  contractAddressNotIn?: InputMaybe<Array<Scalars['String']>>;
  contractAddressNotNil?: InputMaybe<Scalars['Boolean']>;
  /** created_at field predicates */
  createdAt?: InputMaybe<Scalars['Time']>;
  createdAtGT?: InputMaybe<Scalars['Time']>;
  createdAtGTE?: InputMaybe<Scalars['Time']>;
  createdAtIn?: InputMaybe<Array<Scalars['Time']>>;
  createdAtLT?: InputMaybe<Scalars['Time']>;
  createdAtLTE?: InputMaybe<Scalars['Time']>;
  createdAtNEQ?: InputMaybe<Scalars['Time']>;
  createdAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** account_starter_pack edge predicates */
  hasAccountStarterPack?: InputMaybe<Scalars['Boolean']>;
  hasAccountStarterPackWith?: InputMaybe<Array<AccountStarterPackWhereInput>>;
  /** attestations edge predicates */
  hasAttestations?: InputMaybe<Scalars['Boolean']>;
  hasAttestationsWith?: InputMaybe<Array<AttestationWhereInput>>;
  /** contracts edge predicates */
  hasContracts?: InputMaybe<Scalars['Boolean']>;
  hasContractsWith?: InputMaybe<Array<ContractWhereInput>>;
  /** quest_progression edge predicates */
  hasQuestProgression?: InputMaybe<Scalars['Boolean']>;
  hasQuestProgressionWith?: InputMaybe<Array<AccountQuestWhereInput>>;
  /** quests edge predicates */
  hasQuests?: InputMaybe<Scalars['Boolean']>;
  hasQuestsWith?: InputMaybe<Array<QuestWhereInput>>;
  /** starter_packs edge predicates */
  hasStarterPacks?: InputMaybe<Scalars['Boolean']>;
  hasStarterPacksWith?: InputMaybe<Array<StarterPackWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** name field predicates */
  name?: InputMaybe<Scalars['String']>;
  nameContains?: InputMaybe<Scalars['String']>;
  nameContainsFold?: InputMaybe<Scalars['String']>;
  nameEqualFold?: InputMaybe<Scalars['String']>;
  nameGT?: InputMaybe<Scalars['String']>;
  nameGTE?: InputMaybe<Scalars['String']>;
  nameHasPrefix?: InputMaybe<Scalars['String']>;
  nameHasSuffix?: InputMaybe<Scalars['String']>;
  nameIn?: InputMaybe<Array<Scalars['String']>>;
  nameIsNil?: InputMaybe<Scalars['Boolean']>;
  nameLT?: InputMaybe<Scalars['String']>;
  nameLTE?: InputMaybe<Scalars['String']>;
  nameNEQ?: InputMaybe<Scalars['String']>;
  nameNotIn?: InputMaybe<Array<Scalars['String']>>;
  nameNotNil?: InputMaybe<Scalars['Boolean']>;
  not?: InputMaybe<AccountWhereInput>;
  or?: InputMaybe<Array<AccountWhereInput>>;
  /** type field predicates */
  type?: InputMaybe<AccountType>;
  typeIn?: InputMaybe<Array<AccountType>>;
  typeNEQ?: InputMaybe<AccountType>;
  typeNotIn?: InputMaybe<Array<AccountType>>;
  /** updated_at field predicates */
  updatedAt?: InputMaybe<Scalars['Time']>;
  updatedAtGT?: InputMaybe<Scalars['Time']>;
  updatedAtGTE?: InputMaybe<Scalars['Time']>;
  updatedAtIn?: InputMaybe<Array<Scalars['Time']>>;
  updatedAtLT?: InputMaybe<Scalars['Time']>;
  updatedAtLTE?: InputMaybe<Scalars['Time']>;
  updatedAtNEQ?: InputMaybe<Scalars['Time']>;
  updatedAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** version field predicates */
  version?: InputMaybe<Scalars['Long']>;
  versionGT?: InputMaybe<Scalars['Long']>;
  versionGTE?: InputMaybe<Scalars['Long']>;
  versionIn?: InputMaybe<Array<Scalars['Long']>>;
  versionLT?: InputMaybe<Scalars['Long']>;
  versionLTE?: InputMaybe<Scalars['Long']>;
  versionNEQ?: InputMaybe<Scalars['Long']>;
  versionNotIn?: InputMaybe<Array<Scalars['Long']>>;
};

export type Achievement = Node & {
  __typename?: 'Achievement';
  createdAt: Scalars['Time'];
  game: Game;
  gameID: Scalars['ID'];
  id: Scalars['ID'];
  token: Token;
  tokenID: Scalars['ID'];
  updatedAt: Scalars['Time'];
};

/** A connection to a list of items. */
export type AchievementConnection = {
  __typename?: 'AchievementConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<AchievementEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type AchievementEdge = {
  __typename?: 'AchievementEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Achievement>;
};

/** Ordering options for Achievement connections */
export type AchievementOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Achievements. */
  field: AchievementOrderField;
};

/** Properties by which Achievement connections can be ordered. */
export enum AchievementOrderField {
  CreatedAt = 'CREATED_AT'
}

/**
 * AchievementWhereInput is used for filtering Achievement objects.
 * Input was generated by ent.
 */
export type AchievementWhereInput = {
  and?: InputMaybe<Array<AchievementWhereInput>>;
  /** created_at field predicates */
  createdAt?: InputMaybe<Scalars['Time']>;
  createdAtGT?: InputMaybe<Scalars['Time']>;
  createdAtGTE?: InputMaybe<Scalars['Time']>;
  createdAtIn?: InputMaybe<Array<Scalars['Time']>>;
  createdAtLT?: InputMaybe<Scalars['Time']>;
  createdAtLTE?: InputMaybe<Scalars['Time']>;
  createdAtNEQ?: InputMaybe<Scalars['Time']>;
  createdAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** game_id field predicates */
  gameID?: InputMaybe<Scalars['ID']>;
  gameIDContains?: InputMaybe<Scalars['ID']>;
  gameIDContainsFold?: InputMaybe<Scalars['ID']>;
  gameIDEqualFold?: InputMaybe<Scalars['ID']>;
  gameIDGT?: InputMaybe<Scalars['ID']>;
  gameIDGTE?: InputMaybe<Scalars['ID']>;
  gameIDHasPrefix?: InputMaybe<Scalars['ID']>;
  gameIDHasSuffix?: InputMaybe<Scalars['ID']>;
  gameIDIn?: InputMaybe<Array<Scalars['ID']>>;
  gameIDLT?: InputMaybe<Scalars['ID']>;
  gameIDLTE?: InputMaybe<Scalars['ID']>;
  gameIDNEQ?: InputMaybe<Scalars['ID']>;
  gameIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** game edge predicates */
  hasGame?: InputMaybe<Scalars['Boolean']>;
  hasGameWith?: InputMaybe<Array<GameWhereInput>>;
  /** token edge predicates */
  hasToken?: InputMaybe<Scalars['Boolean']>;
  hasTokenWith?: InputMaybe<Array<TokenWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<AchievementWhereInput>;
  or?: InputMaybe<Array<AchievementWhereInput>>;
  /** token_id field predicates */
  tokenID?: InputMaybe<Scalars['ID']>;
  tokenIDContains?: InputMaybe<Scalars['ID']>;
  tokenIDContainsFold?: InputMaybe<Scalars['ID']>;
  tokenIDEqualFold?: InputMaybe<Scalars['ID']>;
  tokenIDGT?: InputMaybe<Scalars['ID']>;
  tokenIDGTE?: InputMaybe<Scalars['ID']>;
  tokenIDHasPrefix?: InputMaybe<Scalars['ID']>;
  tokenIDHasSuffix?: InputMaybe<Scalars['ID']>;
  tokenIDIn?: InputMaybe<Array<Scalars['ID']>>;
  tokenIDLT?: InputMaybe<Scalars['ID']>;
  tokenIDLTE?: InputMaybe<Scalars['ID']>;
  tokenIDNEQ?: InputMaybe<Scalars['ID']>;
  tokenIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** updated_at field predicates */
  updatedAt?: InputMaybe<Scalars['Time']>;
  updatedAtGT?: InputMaybe<Scalars['Time']>;
  updatedAtGTE?: InputMaybe<Scalars['Time']>;
  updatedAtIn?: InputMaybe<Array<Scalars['Time']>>;
  updatedAtLT?: InputMaybe<Scalars['Time']>;
  updatedAtLTE?: InputMaybe<Scalars['Time']>;
  updatedAtNEQ?: InputMaybe<Scalars['Time']>;
  updatedAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
};

export type Attestation = Node & {
  __typename?: 'Attestation';
  account: Account;
  accountID: Scalars['ID'];
  createdAt: Scalars['Time'];
  id: Scalars['ID'];
  serviceID: Scalars['String'];
  type: AttestationType;
  updatedAt: Scalars['Time'];
};

/** A connection to a list of items. */
export type AttestationConnection = {
  __typename?: 'AttestationConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<AttestationEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type AttestationEdge = {
  __typename?: 'AttestationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Attestation>;
};

/** Ordering options for Attestation connections */
export type AttestationOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Attestations. */
  field: AttestationOrderField;
};

/** Properties by which Attestation connections can be ordered. */
export enum AttestationOrderField {
  CreatedAt = 'CREATED_AT'
}

/** AttestationType is enum for the field type */
export enum AttestationType {
  Discord = 'discord',
  Twitter = 'twitter',
  Youtube = 'youtube'
}

/**
 * AttestationWhereInput is used for filtering Attestation objects.
 * Input was generated by ent.
 */
export type AttestationWhereInput = {
  /** account_id field predicates */
  accountID?: InputMaybe<Scalars['ID']>;
  accountIDContains?: InputMaybe<Scalars['ID']>;
  accountIDContainsFold?: InputMaybe<Scalars['ID']>;
  accountIDEqualFold?: InputMaybe<Scalars['ID']>;
  accountIDGT?: InputMaybe<Scalars['ID']>;
  accountIDGTE?: InputMaybe<Scalars['ID']>;
  accountIDHasPrefix?: InputMaybe<Scalars['ID']>;
  accountIDHasSuffix?: InputMaybe<Scalars['ID']>;
  accountIDIn?: InputMaybe<Array<Scalars['ID']>>;
  accountIDLT?: InputMaybe<Scalars['ID']>;
  accountIDLTE?: InputMaybe<Scalars['ID']>;
  accountIDNEQ?: InputMaybe<Scalars['ID']>;
  accountIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  and?: InputMaybe<Array<AttestationWhereInput>>;
  /** created_at field predicates */
  createdAt?: InputMaybe<Scalars['Time']>;
  createdAtGT?: InputMaybe<Scalars['Time']>;
  createdAtGTE?: InputMaybe<Scalars['Time']>;
  createdAtIn?: InputMaybe<Array<Scalars['Time']>>;
  createdAtLT?: InputMaybe<Scalars['Time']>;
  createdAtLTE?: InputMaybe<Scalars['Time']>;
  createdAtNEQ?: InputMaybe<Scalars['Time']>;
  createdAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** account edge predicates */
  hasAccount?: InputMaybe<Scalars['Boolean']>;
  hasAccountWith?: InputMaybe<Array<AccountWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<AttestationWhereInput>;
  or?: InputMaybe<Array<AttestationWhereInput>>;
  /** service_id field predicates */
  serviceID?: InputMaybe<Scalars['String']>;
  serviceIDContains?: InputMaybe<Scalars['String']>;
  serviceIDContainsFold?: InputMaybe<Scalars['String']>;
  serviceIDEqualFold?: InputMaybe<Scalars['String']>;
  serviceIDGT?: InputMaybe<Scalars['String']>;
  serviceIDGTE?: InputMaybe<Scalars['String']>;
  serviceIDHasPrefix?: InputMaybe<Scalars['String']>;
  serviceIDHasSuffix?: InputMaybe<Scalars['String']>;
  serviceIDIn?: InputMaybe<Array<Scalars['String']>>;
  serviceIDLT?: InputMaybe<Scalars['String']>;
  serviceIDLTE?: InputMaybe<Scalars['String']>;
  serviceIDNEQ?: InputMaybe<Scalars['String']>;
  serviceIDNotIn?: InputMaybe<Array<Scalars['String']>>;
  /** type field predicates */
  type?: InputMaybe<AttestationType>;
  typeIn?: InputMaybe<Array<AttestationType>>;
  typeNEQ?: InputMaybe<AttestationType>;
  typeNotIn?: InputMaybe<Array<AttestationType>>;
  /** updated_at field predicates */
  updatedAt?: InputMaybe<Scalars['Time']>;
  updatedAtGT?: InputMaybe<Scalars['Time']>;
  updatedAtGTE?: InputMaybe<Scalars['Time']>;
  updatedAtIn?: InputMaybe<Array<Scalars['Time']>>;
  updatedAtLT?: InputMaybe<Scalars['Time']>;
  updatedAtLTE?: InputMaybe<Scalars['Time']>;
  updatedAtNEQ?: InputMaybe<Scalars['Time']>;
  updatedAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
};

export type Attribute = NumberAttribute | StringAttribute;

export type Balance = Node & {
  __typename?: 'Balance';
  account: Contract;
  balance: Scalars['BigInt'];
  contract: Contract;
  id: Scalars['ID'];
  price?: Maybe<Price>;
  token?: Maybe<Token>;
};


export type BalancePriceArgs = {
  base: CurrencyBase;
};

/** A connection to a list of items. */
export type BalanceConnection = {
  __typename?: 'BalanceConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<BalanceEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type BalanceEdge = {
  __typename?: 'BalanceEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Balance>;
};

/** Ordering options for Balance connections */
export type BalanceOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Balances. */
  field: BalanceOrderField;
};

/** Properties by which Balance connections can be ordered. */
export enum BalanceOrderField {
  Balance = 'BALANCE'
}

/**
 * BalanceWhereInput is used for filtering Balance objects.
 * Input was generated by ent.
 */
export type BalanceWhereInput = {
  and?: InputMaybe<Array<BalanceWhereInput>>;
  /** balance field predicates */
  balance?: InputMaybe<Scalars['BigInt']>;
  balanceGT?: InputMaybe<Scalars['BigInt']>;
  balanceGTE?: InputMaybe<Scalars['BigInt']>;
  balanceIn?: InputMaybe<Array<Scalars['BigInt']>>;
  balanceLT?: InputMaybe<Scalars['BigInt']>;
  balanceLTE?: InputMaybe<Scalars['BigInt']>;
  balanceNEQ?: InputMaybe<Scalars['BigInt']>;
  balanceNotIn?: InputMaybe<Array<Scalars['BigInt']>>;
  /** account edge predicates */
  hasAccount?: InputMaybe<Scalars['Boolean']>;
  hasAccountWith?: InputMaybe<Array<ContractWhereInput>>;
  /** contract edge predicates */
  hasContract?: InputMaybe<Scalars['Boolean']>;
  hasContractWith?: InputMaybe<Array<ContractWhereInput>>;
  /** token edge predicates */
  hasToken?: InputMaybe<Scalars['Boolean']>;
  hasTokenWith?: InputMaybe<Array<TokenWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<BalanceWhereInput>;
  or?: InputMaybe<Array<BalanceWhereInput>>;
};

export type Block = Node & {
  __typename?: 'Block';
  blockHash: Scalars['String'];
  blockNumber: Scalars['Long'];
  id: Scalars['ID'];
  parentBlockHash: Scalars['String'];
  stateRoot: Scalars['String'];
  status: BlockStatus;
  timestamp: Scalars['Time'];
  transactionReceipts: TransactionReceiptConnection;
  transactions: TransactionConnection;
};


export type BlockTransactionReceiptsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TransactionReceiptWhereInput>;
};


export type BlockTransactionsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransactionOrder>;
  where?: InputMaybe<TransactionWhereInput>;
};

/** A connection to a list of items. */
export type BlockConnection = {
  __typename?: 'BlockConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<BlockEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type BlockEdge = {
  __typename?: 'BlockEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Block>;
};

/** Ordering options for Block connections */
export type BlockOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Blocks. */
  field: BlockOrderField;
};

/** Properties by which Block connections can be ordered. */
export enum BlockOrderField {
  BlockNumber = 'BLOCK_NUMBER',
  Timestamp = 'TIMESTAMP'
}

/** BlockStatus is enum for the field status */
export enum BlockStatus {
  AcceptedOnL1 = 'ACCEPTED_ON_L1',
  AcceptedOnL2 = 'ACCEPTED_ON_L2'
}

/**
 * BlockWhereInput is used for filtering Block objects.
 * Input was generated by ent.
 */
export type BlockWhereInput = {
  and?: InputMaybe<Array<BlockWhereInput>>;
  /** block_hash field predicates */
  blockHash?: InputMaybe<Scalars['String']>;
  blockHashContains?: InputMaybe<Scalars['String']>;
  blockHashContainsFold?: InputMaybe<Scalars['String']>;
  blockHashEqualFold?: InputMaybe<Scalars['String']>;
  blockHashGT?: InputMaybe<Scalars['String']>;
  blockHashGTE?: InputMaybe<Scalars['String']>;
  blockHashHasPrefix?: InputMaybe<Scalars['String']>;
  blockHashHasSuffix?: InputMaybe<Scalars['String']>;
  blockHashIn?: InputMaybe<Array<Scalars['String']>>;
  blockHashLT?: InputMaybe<Scalars['String']>;
  blockHashLTE?: InputMaybe<Scalars['String']>;
  blockHashNEQ?: InputMaybe<Scalars['String']>;
  blockHashNotIn?: InputMaybe<Array<Scalars['String']>>;
  /** block_number field predicates */
  blockNumber?: InputMaybe<Scalars['Long']>;
  blockNumberGT?: InputMaybe<Scalars['Long']>;
  blockNumberGTE?: InputMaybe<Scalars['Long']>;
  blockNumberIn?: InputMaybe<Array<Scalars['Long']>>;
  blockNumberLT?: InputMaybe<Scalars['Long']>;
  blockNumberLTE?: InputMaybe<Scalars['Long']>;
  blockNumberNEQ?: InputMaybe<Scalars['Long']>;
  blockNumberNotIn?: InputMaybe<Array<Scalars['Long']>>;
  /** transaction_receipts edge predicates */
  hasTransactionReceipts?: InputMaybe<Scalars['Boolean']>;
  hasTransactionReceiptsWith?: InputMaybe<Array<TransactionReceiptWhereInput>>;
  /** transactions edge predicates */
  hasTransactions?: InputMaybe<Scalars['Boolean']>;
  hasTransactionsWith?: InputMaybe<Array<TransactionWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<BlockWhereInput>;
  or?: InputMaybe<Array<BlockWhereInput>>;
  /** parent_block_hash field predicates */
  parentBlockHash?: InputMaybe<Scalars['String']>;
  parentBlockHashContains?: InputMaybe<Scalars['String']>;
  parentBlockHashContainsFold?: InputMaybe<Scalars['String']>;
  parentBlockHashEqualFold?: InputMaybe<Scalars['String']>;
  parentBlockHashGT?: InputMaybe<Scalars['String']>;
  parentBlockHashGTE?: InputMaybe<Scalars['String']>;
  parentBlockHashHasPrefix?: InputMaybe<Scalars['String']>;
  parentBlockHashHasSuffix?: InputMaybe<Scalars['String']>;
  parentBlockHashIn?: InputMaybe<Array<Scalars['String']>>;
  parentBlockHashLT?: InputMaybe<Scalars['String']>;
  parentBlockHashLTE?: InputMaybe<Scalars['String']>;
  parentBlockHashNEQ?: InputMaybe<Scalars['String']>;
  parentBlockHashNotIn?: InputMaybe<Array<Scalars['String']>>;
  /** state_root field predicates */
  stateRoot?: InputMaybe<Scalars['String']>;
  stateRootContains?: InputMaybe<Scalars['String']>;
  stateRootContainsFold?: InputMaybe<Scalars['String']>;
  stateRootEqualFold?: InputMaybe<Scalars['String']>;
  stateRootGT?: InputMaybe<Scalars['String']>;
  stateRootGTE?: InputMaybe<Scalars['String']>;
  stateRootHasPrefix?: InputMaybe<Scalars['String']>;
  stateRootHasSuffix?: InputMaybe<Scalars['String']>;
  stateRootIn?: InputMaybe<Array<Scalars['String']>>;
  stateRootLT?: InputMaybe<Scalars['String']>;
  stateRootLTE?: InputMaybe<Scalars['String']>;
  stateRootNEQ?: InputMaybe<Scalars['String']>;
  stateRootNotIn?: InputMaybe<Array<Scalars['String']>>;
  /** status field predicates */
  status?: InputMaybe<BlockStatus>;
  statusIn?: InputMaybe<Array<BlockStatus>>;
  statusNEQ?: InputMaybe<BlockStatus>;
  statusNotIn?: InputMaybe<Array<BlockStatus>>;
  /** timestamp field predicates */
  timestamp?: InputMaybe<Scalars['Time']>;
  timestampGT?: InputMaybe<Scalars['Time']>;
  timestampGTE?: InputMaybe<Scalars['Time']>;
  timestampIn?: InputMaybe<Array<Scalars['Time']>>;
  timestampLT?: InputMaybe<Scalars['Time']>;
  timestampLTE?: InputMaybe<Scalars['Time']>;
  timestampNEQ?: InputMaybe<Scalars['Time']>;
  timestampNotIn?: InputMaybe<Array<Scalars['Time']>>;
};

export type Class = Node & {
  __typename?: 'Class';
  contracts: ContractConnection;
  createdAt: Scalars['Time'];
  id: Scalars['ID'];
  updatedAt: Scalars['Time'];
};


export type ClassContractsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ContractOrder>;
  where?: InputMaybe<ContractWhereInput>;
};

/** A connection to a list of items. */
export type ClassConnection = {
  __typename?: 'ClassConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ClassEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type ClassEdge = {
  __typename?: 'ClassEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Class>;
};

/** Ordering options for Class connections */
export type ClassOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Classes. */
  field: ClassOrderField;
};

/** Properties by which Class connections can be ordered. */
export enum ClassOrderField {
  CreatedAt = 'CREATED_AT'
}

/**
 * ClassWhereInput is used for filtering Class objects.
 * Input was generated by ent.
 */
export type ClassWhereInput = {
  and?: InputMaybe<Array<ClassWhereInput>>;
  /** created_at field predicates */
  createdAt?: InputMaybe<Scalars['Time']>;
  createdAtGT?: InputMaybe<Scalars['Time']>;
  createdAtGTE?: InputMaybe<Scalars['Time']>;
  createdAtIn?: InputMaybe<Array<Scalars['Time']>>;
  createdAtLT?: InputMaybe<Scalars['Time']>;
  createdAtLTE?: InputMaybe<Scalars['Time']>;
  createdAtNEQ?: InputMaybe<Scalars['Time']>;
  createdAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** contracts edge predicates */
  hasContracts?: InputMaybe<Scalars['Boolean']>;
  hasContractsWith?: InputMaybe<Array<ContractWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<ClassWhereInput>;
  or?: InputMaybe<Array<ClassWhereInput>>;
  /** updated_at field predicates */
  updatedAt?: InputMaybe<Scalars['Time']>;
  updatedAtGT?: InputMaybe<Scalars['Time']>;
  updatedAtGTE?: InputMaybe<Scalars['Time']>;
  updatedAtIn?: InputMaybe<Array<Scalars['Time']>>;
  updatedAtLT?: InputMaybe<Scalars['Time']>;
  updatedAtLTE?: InputMaybe<Scalars['Time']>;
  updatedAtNEQ?: InputMaybe<Scalars['Time']>;
  updatedAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
};

export type Constraint = {
  __typename?: 'Constraint';
  is?: Maybe<Array<Scalars['BigInt']>>;
  maximum?: Maybe<Scalars['BigInt']>;
  minimum?: Maybe<Scalars['BigInt']>;
};

export type Contract = Node & {
  __typename?: 'Contract';
  account?: Maybe<Account>;
  balances: BalanceConnection;
  class?: Maybe<Class>;
  classID?: Maybe<Scalars['ID']>;
  cover?: Maybe<File>;
  coverID?: Maybe<Scalars['ID']>;
  createdAt: Scalars['Time'];
  deployTransaction?: Maybe<Transaction>;
  description?: Maybe<Scalars['String']>;
  game?: Maybe<Game>;
  gameID?: Maybe<Scalars['ID']>;
  holders: BalanceConnection;
  id: Scalars['ID'];
  incomingTransactions: TransactionConnection;
  metadata?: Maybe<ContractMetadata>;
  name?: Maybe<Scalars['String']>;
  priority: Scalars['Int'];
  scopes: ScopeConnection;
  starterPackFungibles?: Maybe<Array<StarterPackContract>>;
  starterPacks?: Maybe<Array<StarterPack>>;
  tokens: TokenConnection;
  transactions: TransactionConnection;
  type: ContractType;
  updatedAt: Scalars['Time'];
};


export type ContractBalancesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<BalanceOrder>;
  where?: InputMaybe<BalanceWhereInput>;
};


export type ContractHoldersArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<BalanceOrder>;
  where?: InputMaybe<BalanceWhereInput>;
};


export type ContractIncomingTransactionsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransactionOrder>;
  where?: InputMaybe<TransactionWhereInput>;
};


export type ContractScopesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ScopeOrder>;
  where?: InputMaybe<ScopeWhereInput>;
};


export type ContractTokensArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenOrder>;
  where?: InputMaybe<TokenWhereInput>;
};


export type ContractTransactionsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransactionOrder>;
  where?: InputMaybe<TransactionWhereInput>;
};

/** A connection to a list of items. */
export type ContractConnection = {
  __typename?: 'ContractConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ContractEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

export type ContractDeploy = {
  __typename?: 'ContractDeploy';
  type: ContractType;
};

/** An edge in a connection. */
export type ContractEdge = {
  __typename?: 'ContractEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Contract>;
};

export type ContractMetadata = Erc20Metadata | Erc721Metadata;

/** Ordering options for Contract connections */
export type ContractOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Contracts. */
  field: ContractOrderField;
};

/** Properties by which Contract connections can be ordered. */
export enum ContractOrderField {
  CreatedAt = 'CREATED_AT',
  Priority = 'PRIORITY'
}

/** ContractType is enum for the field type */
export enum ContractType {
  Account = 'account',
  Briq = 'briq',
  Controller = 'controller',
  Erc20 = 'erc20',
  Erc721 = 'erc721',
  Erc1155 = 'erc1155',
  Proxy = 'proxy',
  Unknown = 'unknown'
}

/**
 * ContractWhereInput is used for filtering Contract objects.
 * Input was generated by ent.
 */
export type ContractWhereInput = {
  and?: InputMaybe<Array<ContractWhereInput>>;
  /** class_id field predicates */
  classID?: InputMaybe<Scalars['ID']>;
  classIDContains?: InputMaybe<Scalars['ID']>;
  classIDContainsFold?: InputMaybe<Scalars['ID']>;
  classIDEqualFold?: InputMaybe<Scalars['ID']>;
  classIDGT?: InputMaybe<Scalars['ID']>;
  classIDGTE?: InputMaybe<Scalars['ID']>;
  classIDHasPrefix?: InputMaybe<Scalars['ID']>;
  classIDHasSuffix?: InputMaybe<Scalars['ID']>;
  classIDIn?: InputMaybe<Array<Scalars['ID']>>;
  classIDIsNil?: InputMaybe<Scalars['Boolean']>;
  classIDLT?: InputMaybe<Scalars['ID']>;
  classIDLTE?: InputMaybe<Scalars['ID']>;
  classIDNEQ?: InputMaybe<Scalars['ID']>;
  classIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  classIDNotNil?: InputMaybe<Scalars['Boolean']>;
  /** cover_id field predicates */
  coverID?: InputMaybe<Scalars['ID']>;
  coverIDContains?: InputMaybe<Scalars['ID']>;
  coverIDContainsFold?: InputMaybe<Scalars['ID']>;
  coverIDEqualFold?: InputMaybe<Scalars['ID']>;
  coverIDGT?: InputMaybe<Scalars['ID']>;
  coverIDGTE?: InputMaybe<Scalars['ID']>;
  coverIDHasPrefix?: InputMaybe<Scalars['ID']>;
  coverIDHasSuffix?: InputMaybe<Scalars['ID']>;
  coverIDIn?: InputMaybe<Array<Scalars['ID']>>;
  coverIDIsNil?: InputMaybe<Scalars['Boolean']>;
  coverIDLT?: InputMaybe<Scalars['ID']>;
  coverIDLTE?: InputMaybe<Scalars['ID']>;
  coverIDNEQ?: InputMaybe<Scalars['ID']>;
  coverIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  coverIDNotNil?: InputMaybe<Scalars['Boolean']>;
  /** created_at field predicates */
  createdAt?: InputMaybe<Scalars['Time']>;
  createdAtGT?: InputMaybe<Scalars['Time']>;
  createdAtGTE?: InputMaybe<Scalars['Time']>;
  createdAtIn?: InputMaybe<Array<Scalars['Time']>>;
  createdAtLT?: InputMaybe<Scalars['Time']>;
  createdAtLTE?: InputMaybe<Scalars['Time']>;
  createdAtNEQ?: InputMaybe<Scalars['Time']>;
  createdAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** description field predicates */
  description?: InputMaybe<Scalars['String']>;
  descriptionContains?: InputMaybe<Scalars['String']>;
  descriptionContainsFold?: InputMaybe<Scalars['String']>;
  descriptionEqualFold?: InputMaybe<Scalars['String']>;
  descriptionGT?: InputMaybe<Scalars['String']>;
  descriptionGTE?: InputMaybe<Scalars['String']>;
  descriptionHasPrefix?: InputMaybe<Scalars['String']>;
  descriptionHasSuffix?: InputMaybe<Scalars['String']>;
  descriptionIn?: InputMaybe<Array<Scalars['String']>>;
  descriptionIsNil?: InputMaybe<Scalars['Boolean']>;
  descriptionLT?: InputMaybe<Scalars['String']>;
  descriptionLTE?: InputMaybe<Scalars['String']>;
  descriptionNEQ?: InputMaybe<Scalars['String']>;
  descriptionNotIn?: InputMaybe<Array<Scalars['String']>>;
  descriptionNotNil?: InputMaybe<Scalars['Boolean']>;
  /** game_id field predicates */
  gameID?: InputMaybe<Scalars['ID']>;
  gameIDContains?: InputMaybe<Scalars['ID']>;
  gameIDContainsFold?: InputMaybe<Scalars['ID']>;
  gameIDEqualFold?: InputMaybe<Scalars['ID']>;
  gameIDGT?: InputMaybe<Scalars['ID']>;
  gameIDGTE?: InputMaybe<Scalars['ID']>;
  gameIDHasPrefix?: InputMaybe<Scalars['ID']>;
  gameIDHasSuffix?: InputMaybe<Scalars['ID']>;
  gameIDIn?: InputMaybe<Array<Scalars['ID']>>;
  gameIDIsNil?: InputMaybe<Scalars['Boolean']>;
  gameIDLT?: InputMaybe<Scalars['ID']>;
  gameIDLTE?: InputMaybe<Scalars['ID']>;
  gameIDNEQ?: InputMaybe<Scalars['ID']>;
  gameIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  gameIDNotNil?: InputMaybe<Scalars['Boolean']>;
  /** account edge predicates */
  hasAccount?: InputMaybe<Scalars['Boolean']>;
  hasAccountWith?: InputMaybe<Array<AccountWhereInput>>;
  /** balances edge predicates */
  hasBalances?: InputMaybe<Scalars['Boolean']>;
  hasBalancesWith?: InputMaybe<Array<BalanceWhereInput>>;
  /** class edge predicates */
  hasClass?: InputMaybe<Scalars['Boolean']>;
  hasClassWith?: InputMaybe<Array<ClassWhereInput>>;
  /** cover edge predicates */
  hasCover?: InputMaybe<Scalars['Boolean']>;
  hasCoverWith?: InputMaybe<Array<FileWhereInput>>;
  /** deploy_transaction edge predicates */
  hasDeployTransaction?: InputMaybe<Scalars['Boolean']>;
  hasDeployTransactionWith?: InputMaybe<Array<TransactionWhereInput>>;
  /** game edge predicates */
  hasGame?: InputMaybe<Scalars['Boolean']>;
  hasGameWith?: InputMaybe<Array<GameWhereInput>>;
  /** holders edge predicates */
  hasHolders?: InputMaybe<Scalars['Boolean']>;
  hasHoldersWith?: InputMaybe<Array<BalanceWhereInput>>;
  /** incoming_transactions edge predicates */
  hasIncomingTransactions?: InputMaybe<Scalars['Boolean']>;
  hasIncomingTransactionsWith?: InputMaybe<Array<TransactionWhereInput>>;
  /** scopes edge predicates */
  hasScopes?: InputMaybe<Scalars['Boolean']>;
  hasScopesWith?: InputMaybe<Array<ScopeWhereInput>>;
  /** starter_pack_fungibles edge predicates */
  hasStarterPackFungibles?: InputMaybe<Scalars['Boolean']>;
  hasStarterPackFungiblesWith?: InputMaybe<Array<StarterPackContractWhereInput>>;
  /** starter_packs edge predicates */
  hasStarterPacks?: InputMaybe<Scalars['Boolean']>;
  hasStarterPacksWith?: InputMaybe<Array<StarterPackWhereInput>>;
  /** tokens edge predicates */
  hasTokens?: InputMaybe<Scalars['Boolean']>;
  hasTokensWith?: InputMaybe<Array<TokenWhereInput>>;
  /** transactions edge predicates */
  hasTransactions?: InputMaybe<Scalars['Boolean']>;
  hasTransactionsWith?: InputMaybe<Array<TransactionWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** name field predicates */
  name?: InputMaybe<Scalars['String']>;
  nameContains?: InputMaybe<Scalars['String']>;
  nameContainsFold?: InputMaybe<Scalars['String']>;
  nameEqualFold?: InputMaybe<Scalars['String']>;
  nameGT?: InputMaybe<Scalars['String']>;
  nameGTE?: InputMaybe<Scalars['String']>;
  nameHasPrefix?: InputMaybe<Scalars['String']>;
  nameHasSuffix?: InputMaybe<Scalars['String']>;
  nameIn?: InputMaybe<Array<Scalars['String']>>;
  nameIsNil?: InputMaybe<Scalars['Boolean']>;
  nameLT?: InputMaybe<Scalars['String']>;
  nameLTE?: InputMaybe<Scalars['String']>;
  nameNEQ?: InputMaybe<Scalars['String']>;
  nameNotIn?: InputMaybe<Array<Scalars['String']>>;
  nameNotNil?: InputMaybe<Scalars['Boolean']>;
  not?: InputMaybe<ContractWhereInput>;
  or?: InputMaybe<Array<ContractWhereInput>>;
  /** priority field predicates */
  priority?: InputMaybe<Scalars['Int']>;
  priorityGT?: InputMaybe<Scalars['Int']>;
  priorityGTE?: InputMaybe<Scalars['Int']>;
  priorityIn?: InputMaybe<Array<Scalars['Int']>>;
  priorityLT?: InputMaybe<Scalars['Int']>;
  priorityLTE?: InputMaybe<Scalars['Int']>;
  priorityNEQ?: InputMaybe<Scalars['Int']>;
  priorityNotIn?: InputMaybe<Array<Scalars['Int']>>;
  /** type field predicates */
  type?: InputMaybe<ContractType>;
  typeIn?: InputMaybe<Array<ContractType>>;
  typeNEQ?: InputMaybe<ContractType>;
  typeNotIn?: InputMaybe<Array<ContractType>>;
  /** updated_at field predicates */
  updatedAt?: InputMaybe<Scalars['Time']>;
  updatedAtGT?: InputMaybe<Scalars['Time']>;
  updatedAtGTE?: InputMaybe<Scalars['Time']>;
  updatedAtIn?: InputMaybe<Array<Scalars['Time']>>;
  updatedAtLT?: InputMaybe<Scalars['Time']>;
  updatedAtLTE?: InputMaybe<Scalars['Time']>;
  updatedAtNEQ?: InputMaybe<Scalars['Time']>;
  updatedAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
};

export type Credential = {
  __typename?: 'Credential';
  id: Scalars['ID'];
  publicKey: Scalars['String'];
};

export enum CurrencyBase {
  Usd = 'USD'
}

export enum CurrencyQuote {
  Btc = 'BTC',
  Eth = 'ETH'
}

export type DiscordGuild = Node & {
  __typename?: 'DiscordGuild';
  id: Scalars['ID'];
  quests: QuestConnection;
  tokenRequirements: TokenRequirements;
};


export type DiscordGuildQuestsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<QuestOrder>;
  where?: InputMaybe<QuestWhereInput>;
};

/** A connection to a list of items. */
export type DiscordGuildConnection = {
  __typename?: 'DiscordGuildConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DiscordGuildEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type DiscordGuildEdge = {
  __typename?: 'DiscordGuildEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<DiscordGuild>;
};

/**
 * DiscordGuildWhereInput is used for filtering DiscordGuild objects.
 * Input was generated by ent.
 */
export type DiscordGuildWhereInput = {
  and?: InputMaybe<Array<DiscordGuildWhereInput>>;
  /** quests edge predicates */
  hasQuests?: InputMaybe<Scalars['Boolean']>;
  hasQuestsWith?: InputMaybe<Array<QuestWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<DiscordGuildWhereInput>;
  or?: InputMaybe<Array<DiscordGuildWhereInput>>;
};

export type Erc20Metadata = {
  __typename?: 'ERC20Metadata';
  decimals?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  symbol?: Maybe<Scalars['String']>;
};

export type Erc721Metadata = {
  __typename?: 'ERC721Metadata';
  name?: Maybe<Scalars['String']>;
  symbol?: Maybe<Scalars['String']>;
};

export type Event = Node & {
  __typename?: 'Event';
  data: Array<Maybe<Scalars['Felt']>>;
  from: Scalars['String'];
  id: Scalars['ID'];
  keys: Array<Maybe<Scalars['Felt']>>;
  transaction: Transaction;
  transactionID: Scalars['ID'];
};

/** A connection to a list of items. */
export type EventConnection = {
  __typename?: 'EventConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<EventEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type EventEdge = {
  __typename?: 'EventEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Event>;
};

/**
 * EventWhereInput is used for filtering Event objects.
 * Input was generated by ent.
 */
export type EventWhereInput = {
  and?: InputMaybe<Array<EventWhereInput>>;
  /** from field predicates */
  from?: InputMaybe<Scalars['String']>;
  fromContains?: InputMaybe<Scalars['String']>;
  fromContainsFold?: InputMaybe<Scalars['String']>;
  fromEqualFold?: InputMaybe<Scalars['String']>;
  fromGT?: InputMaybe<Scalars['String']>;
  fromGTE?: InputMaybe<Scalars['String']>;
  fromHasPrefix?: InputMaybe<Scalars['String']>;
  fromHasSuffix?: InputMaybe<Scalars['String']>;
  fromIn?: InputMaybe<Array<Scalars['String']>>;
  fromLT?: InputMaybe<Scalars['String']>;
  fromLTE?: InputMaybe<Scalars['String']>;
  fromNEQ?: InputMaybe<Scalars['String']>;
  fromNotIn?: InputMaybe<Array<Scalars['String']>>;
  hasData?: InputMaybe<Scalars['String']>;
  hasDataAt?: InputMaybe<HasValueInput>;
  hasKey?: InputMaybe<Scalars['String']>;
  hasKeyAt?: InputMaybe<HasValueInput>;
  /** transaction edge predicates */
  hasTransaction?: InputMaybe<Scalars['Boolean']>;
  hasTransactionWith?: InputMaybe<Array<TransactionWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<EventWhereInput>;
  or?: InputMaybe<Array<EventWhereInput>>;
  /** transaction_id field predicates */
  transactionID?: InputMaybe<Scalars['ID']>;
  transactionIDContains?: InputMaybe<Scalars['ID']>;
  transactionIDContainsFold?: InputMaybe<Scalars['ID']>;
  transactionIDEqualFold?: InputMaybe<Scalars['ID']>;
  transactionIDGT?: InputMaybe<Scalars['ID']>;
  transactionIDGTE?: InputMaybe<Scalars['ID']>;
  transactionIDHasPrefix?: InputMaybe<Scalars['ID']>;
  transactionIDHasSuffix?: InputMaybe<Scalars['ID']>;
  transactionIDIn?: InputMaybe<Array<Scalars['ID']>>;
  transactionIDLT?: InputMaybe<Scalars['ID']>;
  transactionIDLTE?: InputMaybe<Scalars['ID']>;
  transactionIDNEQ?: InputMaybe<Scalars['ID']>;
  transactionIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
};

export type File = Node & {
  __typename?: 'File';
  alt?: Maybe<Scalars['String']>;
  createdAt: Scalars['Time'];
  directory: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  priority: Scalars['Int'];
  thumbnail: Scalars['String'];
  updatedAt: Scalars['Time'];
  uri: Scalars['String'];
};

/** A connection to a list of items. */
export type FileConnection = {
  __typename?: 'FileConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<FileEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type FileEdge = {
  __typename?: 'FileEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<File>;
};

/** Ordering options for File connections */
export type FileOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Files. */
  field: FileOrderField;
};

/** Properties by which File connections can be ordered. */
export enum FileOrderField {
  CreatedAt = 'CREATED_AT',
  Priority = 'PRIORITY'
}

/**
 * FileWhereInput is used for filtering File objects.
 * Input was generated by ent.
 */
export type FileWhereInput = {
  /** alt field predicates */
  alt?: InputMaybe<Scalars['String']>;
  altContains?: InputMaybe<Scalars['String']>;
  altContainsFold?: InputMaybe<Scalars['String']>;
  altEqualFold?: InputMaybe<Scalars['String']>;
  altGT?: InputMaybe<Scalars['String']>;
  altGTE?: InputMaybe<Scalars['String']>;
  altHasPrefix?: InputMaybe<Scalars['String']>;
  altHasSuffix?: InputMaybe<Scalars['String']>;
  altIn?: InputMaybe<Array<Scalars['String']>>;
  altIsNil?: InputMaybe<Scalars['Boolean']>;
  altLT?: InputMaybe<Scalars['String']>;
  altLTE?: InputMaybe<Scalars['String']>;
  altNEQ?: InputMaybe<Scalars['String']>;
  altNotIn?: InputMaybe<Array<Scalars['String']>>;
  altNotNil?: InputMaybe<Scalars['Boolean']>;
  and?: InputMaybe<Array<FileWhereInput>>;
  /** created_at field predicates */
  createdAt?: InputMaybe<Scalars['Time']>;
  createdAtGT?: InputMaybe<Scalars['Time']>;
  createdAtGTE?: InputMaybe<Scalars['Time']>;
  createdAtIn?: InputMaybe<Array<Scalars['Time']>>;
  createdAtLT?: InputMaybe<Scalars['Time']>;
  createdAtLTE?: InputMaybe<Scalars['Time']>;
  createdAtNEQ?: InputMaybe<Scalars['Time']>;
  createdAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** directory field predicates */
  directory?: InputMaybe<Scalars['String']>;
  directoryContains?: InputMaybe<Scalars['String']>;
  directoryContainsFold?: InputMaybe<Scalars['String']>;
  directoryEqualFold?: InputMaybe<Scalars['String']>;
  directoryGT?: InputMaybe<Scalars['String']>;
  directoryGTE?: InputMaybe<Scalars['String']>;
  directoryHasPrefix?: InputMaybe<Scalars['String']>;
  directoryHasSuffix?: InputMaybe<Scalars['String']>;
  directoryIn?: InputMaybe<Array<Scalars['String']>>;
  directoryLT?: InputMaybe<Scalars['String']>;
  directoryLTE?: InputMaybe<Scalars['String']>;
  directoryNEQ?: InputMaybe<Scalars['String']>;
  directoryNotIn?: InputMaybe<Array<Scalars['String']>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** name field predicates */
  name?: InputMaybe<Scalars['String']>;
  nameContains?: InputMaybe<Scalars['String']>;
  nameContainsFold?: InputMaybe<Scalars['String']>;
  nameEqualFold?: InputMaybe<Scalars['String']>;
  nameGT?: InputMaybe<Scalars['String']>;
  nameGTE?: InputMaybe<Scalars['String']>;
  nameHasPrefix?: InputMaybe<Scalars['String']>;
  nameHasSuffix?: InputMaybe<Scalars['String']>;
  nameIn?: InputMaybe<Array<Scalars['String']>>;
  nameLT?: InputMaybe<Scalars['String']>;
  nameLTE?: InputMaybe<Scalars['String']>;
  nameNEQ?: InputMaybe<Scalars['String']>;
  nameNotIn?: InputMaybe<Array<Scalars['String']>>;
  not?: InputMaybe<FileWhereInput>;
  or?: InputMaybe<Array<FileWhereInput>>;
  /** priority field predicates */
  priority?: InputMaybe<Scalars['Int']>;
  priorityGT?: InputMaybe<Scalars['Int']>;
  priorityGTE?: InputMaybe<Scalars['Int']>;
  priorityIn?: InputMaybe<Array<Scalars['Int']>>;
  priorityLT?: InputMaybe<Scalars['Int']>;
  priorityLTE?: InputMaybe<Scalars['Int']>;
  priorityNEQ?: InputMaybe<Scalars['Int']>;
  priorityNotIn?: InputMaybe<Array<Scalars['Int']>>;
  /** updated_at field predicates */
  updatedAt?: InputMaybe<Scalars['Time']>;
  updatedAtGT?: InputMaybe<Scalars['Time']>;
  updatedAtGTE?: InputMaybe<Scalars['Time']>;
  updatedAtIn?: InputMaybe<Array<Scalars['Time']>>;
  updatedAtLT?: InputMaybe<Scalars['Time']>;
  updatedAtLTE?: InputMaybe<Scalars['Time']>;
  updatedAtNEQ?: InputMaybe<Scalars['Time']>;
  updatedAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
};

export type FunctionCallInput = {
  calldata?: InputMaybe<Array<Scalars['String']>>;
  contractAddress: Scalars['String'];
  entryPointSelector: Scalars['String'];
};

export type FungibleTransfer = {
  __typename?: 'FungibleTransfer';
  amount: Scalars['BigInt'];
  from: Scalars['ID'];
  to: Scalars['ID'];
};

export type Game = Node & {
  __typename?: 'Game';
  achievements: AchievementConnection;
  active: Scalars['Boolean'];
  banner?: Maybe<File>;
  bannerID?: Maybe<Scalars['ID']>;
  contracts: ContractConnection;
  cover?: Maybe<File>;
  coverID?: Maybe<Scalars['ID']>;
  createdAt: Scalars['Time'];
  description: Scalars['String'];
  icon?: Maybe<File>;
  iconID?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  media: FileConnection;
  name: Scalars['String'];
  priority: Scalars['Int'];
  profilePicture?: Maybe<File>;
  profilePictureID?: Maybe<Scalars['ID']>;
  quests: QuestConnection;
  scopes: ScopeConnection;
  socials: Socials;
  starterPack?: Maybe<StarterPack>;
  updatedAt: Scalars['Time'];
};


export type GameAchievementsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AchievementOrder>;
  where?: InputMaybe<AchievementWhereInput>;
};


export type GameContractsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ContractOrder>;
  where?: InputMaybe<ContractWhereInput>;
};


export type GameMediaArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<FileOrder>;
  where?: InputMaybe<FileWhereInput>;
};


export type GameQuestsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<QuestOrder>;
  where?: InputMaybe<QuestWhereInput>;
};


export type GameScopesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ScopeOrder>;
  where?: InputMaybe<ScopeWhereInput>;
};

/** A connection to a list of items. */
export type GameConnection = {
  __typename?: 'GameConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<GameEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type GameEdge = {
  __typename?: 'GameEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Game>;
};

/** Ordering options for Game connections */
export type GameOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Games. */
  field: GameOrderField;
};

/** Properties by which Game connections can be ordered. */
export enum GameOrderField {
  CreatedAt = 'CREATED_AT',
  Priority = 'PRIORITY'
}

/**
 * GameWhereInput is used for filtering Game objects.
 * Input was generated by ent.
 */
export type GameWhereInput = {
  /** active field predicates */
  active?: InputMaybe<Scalars['Boolean']>;
  activeNEQ?: InputMaybe<Scalars['Boolean']>;
  and?: InputMaybe<Array<GameWhereInput>>;
  /** banner_id field predicates */
  bannerID?: InputMaybe<Scalars['ID']>;
  bannerIDContains?: InputMaybe<Scalars['ID']>;
  bannerIDContainsFold?: InputMaybe<Scalars['ID']>;
  bannerIDEqualFold?: InputMaybe<Scalars['ID']>;
  bannerIDGT?: InputMaybe<Scalars['ID']>;
  bannerIDGTE?: InputMaybe<Scalars['ID']>;
  bannerIDHasPrefix?: InputMaybe<Scalars['ID']>;
  bannerIDHasSuffix?: InputMaybe<Scalars['ID']>;
  bannerIDIn?: InputMaybe<Array<Scalars['ID']>>;
  bannerIDIsNil?: InputMaybe<Scalars['Boolean']>;
  bannerIDLT?: InputMaybe<Scalars['ID']>;
  bannerIDLTE?: InputMaybe<Scalars['ID']>;
  bannerIDNEQ?: InputMaybe<Scalars['ID']>;
  bannerIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  bannerIDNotNil?: InputMaybe<Scalars['Boolean']>;
  /** cover_id field predicates */
  coverID?: InputMaybe<Scalars['ID']>;
  coverIDContains?: InputMaybe<Scalars['ID']>;
  coverIDContainsFold?: InputMaybe<Scalars['ID']>;
  coverIDEqualFold?: InputMaybe<Scalars['ID']>;
  coverIDGT?: InputMaybe<Scalars['ID']>;
  coverIDGTE?: InputMaybe<Scalars['ID']>;
  coverIDHasPrefix?: InputMaybe<Scalars['ID']>;
  coverIDHasSuffix?: InputMaybe<Scalars['ID']>;
  coverIDIn?: InputMaybe<Array<Scalars['ID']>>;
  coverIDIsNil?: InputMaybe<Scalars['Boolean']>;
  coverIDLT?: InputMaybe<Scalars['ID']>;
  coverIDLTE?: InputMaybe<Scalars['ID']>;
  coverIDNEQ?: InputMaybe<Scalars['ID']>;
  coverIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  coverIDNotNil?: InputMaybe<Scalars['Boolean']>;
  /** created_at field predicates */
  createdAt?: InputMaybe<Scalars['Time']>;
  createdAtGT?: InputMaybe<Scalars['Time']>;
  createdAtGTE?: InputMaybe<Scalars['Time']>;
  createdAtIn?: InputMaybe<Array<Scalars['Time']>>;
  createdAtLT?: InputMaybe<Scalars['Time']>;
  createdAtLTE?: InputMaybe<Scalars['Time']>;
  createdAtNEQ?: InputMaybe<Scalars['Time']>;
  createdAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** description field predicates */
  description?: InputMaybe<Scalars['String']>;
  descriptionContains?: InputMaybe<Scalars['String']>;
  descriptionContainsFold?: InputMaybe<Scalars['String']>;
  descriptionEqualFold?: InputMaybe<Scalars['String']>;
  descriptionGT?: InputMaybe<Scalars['String']>;
  descriptionGTE?: InputMaybe<Scalars['String']>;
  descriptionHasPrefix?: InputMaybe<Scalars['String']>;
  descriptionHasSuffix?: InputMaybe<Scalars['String']>;
  descriptionIn?: InputMaybe<Array<Scalars['String']>>;
  descriptionLT?: InputMaybe<Scalars['String']>;
  descriptionLTE?: InputMaybe<Scalars['String']>;
  descriptionNEQ?: InputMaybe<Scalars['String']>;
  descriptionNotIn?: InputMaybe<Array<Scalars['String']>>;
  /** achievements edge predicates */
  hasAchievements?: InputMaybe<Scalars['Boolean']>;
  hasAchievementsWith?: InputMaybe<Array<AchievementWhereInput>>;
  /** banner edge predicates */
  hasBanner?: InputMaybe<Scalars['Boolean']>;
  hasBannerWith?: InputMaybe<Array<FileWhereInput>>;
  /** contracts edge predicates */
  hasContracts?: InputMaybe<Scalars['Boolean']>;
  hasContractsWith?: InputMaybe<Array<ContractWhereInput>>;
  /** cover edge predicates */
  hasCover?: InputMaybe<Scalars['Boolean']>;
  hasCoverWith?: InputMaybe<Array<FileWhereInput>>;
  /** icon edge predicates */
  hasIcon?: InputMaybe<Scalars['Boolean']>;
  hasIconWith?: InputMaybe<Array<FileWhereInput>>;
  /** media edge predicates */
  hasMedia?: InputMaybe<Scalars['Boolean']>;
  hasMediaWith?: InputMaybe<Array<FileWhereInput>>;
  /** profile_picture edge predicates */
  hasProfilePicture?: InputMaybe<Scalars['Boolean']>;
  hasProfilePictureWith?: InputMaybe<Array<FileWhereInput>>;
  /** quests edge predicates */
  hasQuests?: InputMaybe<Scalars['Boolean']>;
  hasQuestsWith?: InputMaybe<Array<QuestWhereInput>>;
  /** scopes edge predicates */
  hasScopes?: InputMaybe<Scalars['Boolean']>;
  hasScopesWith?: InputMaybe<Array<ScopeWhereInput>>;
  /** starter_pack edge predicates */
  hasStarterPack?: InputMaybe<Scalars['Boolean']>;
  hasStarterPackWith?: InputMaybe<Array<StarterPackWhereInput>>;
  /** icon_id field predicates */
  iconID?: InputMaybe<Scalars['ID']>;
  iconIDContains?: InputMaybe<Scalars['ID']>;
  iconIDContainsFold?: InputMaybe<Scalars['ID']>;
  iconIDEqualFold?: InputMaybe<Scalars['ID']>;
  iconIDGT?: InputMaybe<Scalars['ID']>;
  iconIDGTE?: InputMaybe<Scalars['ID']>;
  iconIDHasPrefix?: InputMaybe<Scalars['ID']>;
  iconIDHasSuffix?: InputMaybe<Scalars['ID']>;
  iconIDIn?: InputMaybe<Array<Scalars['ID']>>;
  iconIDIsNil?: InputMaybe<Scalars['Boolean']>;
  iconIDLT?: InputMaybe<Scalars['ID']>;
  iconIDLTE?: InputMaybe<Scalars['ID']>;
  iconIDNEQ?: InputMaybe<Scalars['ID']>;
  iconIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  iconIDNotNil?: InputMaybe<Scalars['Boolean']>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** name field predicates */
  name?: InputMaybe<Scalars['String']>;
  nameContains?: InputMaybe<Scalars['String']>;
  nameContainsFold?: InputMaybe<Scalars['String']>;
  nameEqualFold?: InputMaybe<Scalars['String']>;
  nameGT?: InputMaybe<Scalars['String']>;
  nameGTE?: InputMaybe<Scalars['String']>;
  nameHasPrefix?: InputMaybe<Scalars['String']>;
  nameHasSuffix?: InputMaybe<Scalars['String']>;
  nameIn?: InputMaybe<Array<Scalars['String']>>;
  nameLT?: InputMaybe<Scalars['String']>;
  nameLTE?: InputMaybe<Scalars['String']>;
  nameNEQ?: InputMaybe<Scalars['String']>;
  nameNotIn?: InputMaybe<Array<Scalars['String']>>;
  not?: InputMaybe<GameWhereInput>;
  or?: InputMaybe<Array<GameWhereInput>>;
  /** priority field predicates */
  priority?: InputMaybe<Scalars['Int']>;
  priorityGT?: InputMaybe<Scalars['Int']>;
  priorityGTE?: InputMaybe<Scalars['Int']>;
  priorityIn?: InputMaybe<Array<Scalars['Int']>>;
  priorityLT?: InputMaybe<Scalars['Int']>;
  priorityLTE?: InputMaybe<Scalars['Int']>;
  priorityNEQ?: InputMaybe<Scalars['Int']>;
  priorityNotIn?: InputMaybe<Array<Scalars['Int']>>;
  /** profile_picture_id field predicates */
  profilePictureID?: InputMaybe<Scalars['ID']>;
  profilePictureIDContains?: InputMaybe<Scalars['ID']>;
  profilePictureIDContainsFold?: InputMaybe<Scalars['ID']>;
  profilePictureIDEqualFold?: InputMaybe<Scalars['ID']>;
  profilePictureIDGT?: InputMaybe<Scalars['ID']>;
  profilePictureIDGTE?: InputMaybe<Scalars['ID']>;
  profilePictureIDHasPrefix?: InputMaybe<Scalars['ID']>;
  profilePictureIDHasSuffix?: InputMaybe<Scalars['ID']>;
  profilePictureIDIn?: InputMaybe<Array<Scalars['ID']>>;
  profilePictureIDIsNil?: InputMaybe<Scalars['Boolean']>;
  profilePictureIDLT?: InputMaybe<Scalars['ID']>;
  profilePictureIDLTE?: InputMaybe<Scalars['ID']>;
  profilePictureIDNEQ?: InputMaybe<Scalars['ID']>;
  profilePictureIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  profilePictureIDNotNil?: InputMaybe<Scalars['Boolean']>;
  /** updated_at field predicates */
  updatedAt?: InputMaybe<Scalars['Time']>;
  updatedAtGT?: InputMaybe<Scalars['Time']>;
  updatedAtGTE?: InputMaybe<Scalars['Time']>;
  updatedAtIn?: InputMaybe<Array<Scalars['Time']>>;
  updatedAtLT?: InputMaybe<Scalars['Time']>;
  updatedAtLTE?: InputMaybe<Scalars['Time']>;
  updatedAtNEQ?: InputMaybe<Scalars['Time']>;
  updatedAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
};

export type HasValueInput = {
  index: Scalars['Int'];
  value: Scalars['String'];
};

export type L1Message = {
  __typename?: 'L1Message';
  payload?: Maybe<Array<Scalars['Felt']>>;
  toAddress: Scalars['String'];
};

export type L2Message = {
  __typename?: 'L2Message';
  fromAddress: Scalars['String'];
  payload?: Maybe<Array<Scalars['Felt']>>;
};

export type Metadata = {
  __typename?: 'Metadata';
  animation?: Maybe<Scalars['String']>;
  attributes?: Maybe<Array<Attribute>>;
  backgroundColor?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  externalURL?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
};

export type Mint = {
  __typename?: 'Mint';
  amount: Scalars['BigInt'];
  to: Scalars['ID'];
  tokenId: Scalars['BigInt'];
};

export type Mutation = {
  __typename?: 'Mutation';
  beginLogin: Scalars['JSON'];
  beginRegistration: Scalars['JSON'];
  checkDiscordQuests: Scalars['Boolean'];
  checkTwitterQuests: Scalars['Boolean'];
  claimQuestRewards: Scalars['JSON'];
  claimStarterpack?: Maybe<Scalars['String']>;
  createAchievement: Scalars['Boolean'];
  createGame: Scalars['Boolean'];
  createQuest: Scalars['Boolean'];
  createQuestRewards: Scalars['Boolean'];
  createScopes: Scalars['Boolean'];
  createStarterpack?: Maybe<Scalars['ID']>;
  deployAccount: Contract;
  finalizeLogin: Scalars['Boolean'];
  finalizeRegistration: Account;
  removeStarterpack: Scalars['Boolean'];
  updateAchievement: Scalars['Boolean'];
  updateContract: Scalars['Boolean'];
  updateFile: Scalars['Boolean'];
  updateGame: Scalars['Boolean'];
  updateStarterpack: Scalars['Boolean'];
  upload: Array<File>;
};


export type MutationBeginLoginArgs = {
  id: Scalars['String'];
};


export type MutationBeginRegistrationArgs = {
  id: Scalars['String'];
};


export type MutationCheckDiscordQuestsArgs = {
  accountId: Scalars['ID'];
};


export type MutationCheckTwitterQuestsArgs = {
  accountId: Scalars['ID'];
};


export type MutationClaimQuestRewardsArgs = {
  accountId: Scalars['ID'];
  questId: Scalars['ID'];
};


export type MutationClaimStarterpackArgs = {
  account: Scalars['ID'];
  starterpackId: Scalars['ID'];
};


export type MutationCreateAchievementArgs = {
  gameId: Scalars['ID'];
  metadataURI: Scalars['String'];
};


export type MutationCreateGameArgs = {
  active?: InputMaybe<Scalars['Boolean']>;
  banner?: InputMaybe<Scalars['ID']>;
  cover?: InputMaybe<Scalars['ID']>;
  description: Scalars['String'];
  icon?: InputMaybe<Scalars['ID']>;
  name: Scalars['String'];
  priority?: InputMaybe<Scalars['Int']>;
  profilePicture?: InputMaybe<Scalars['ID']>;
  socials?: InputMaybe<SocialsInput>;
};


export type MutationCreateQuestArgs = {
  description: Scalars['String'];
  gameId: Scalars['ID'];
  points: Scalars['BigInt'];
  title: Scalars['String'];
};


export type MutationCreateQuestRewardsArgs = {
  questId: Scalars['ID'];
  tokenIds?: InputMaybe<Array<Scalars['ID']>>;
};


export type MutationCreateScopesArgs = {
  scopes?: InputMaybe<Array<ScopeInput>>;
};


export type MutationCreateStarterpackArgs = {
  active?: InputMaybe<Scalars['Boolean']>;
  call: FunctionCallInput;
  description?: InputMaybe<Scalars['String']>;
  gameId: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
};


export type MutationDeployAccountArgs = {
  chainId: Scalars['ChainID'];
  id: Scalars['ID'];
  starterpackIds?: InputMaybe<Array<Scalars['ID']>>;
};


export type MutationFinalizeLoginArgs = {
  credentials: Scalars['String'];
};


export type MutationFinalizeRegistrationArgs = {
  credentials: Scalars['String'];
  signer: Scalars['String'];
};


export type MutationRemoveStarterpackArgs = {
  id: Scalars['ID'];
};


export type MutationUpdateAchievementArgs = {
  gameId: Scalars['ID'];
  id: Scalars['ID'];
  metadataURI: Scalars['String'];
  tokenId: Scalars['ID'];
};


export type MutationUpdateContractArgs = {
  cover?: InputMaybe<Scalars['ID']>;
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  priority?: InputMaybe<Scalars['Int']>;
};


export type MutationUpdateFileArgs = {
  id: Scalars['ID'];
  priority: Scalars['Int'];
};


export type MutationUpdateGameArgs = {
  active?: InputMaybe<Scalars['Boolean']>;
  addContracts?: InputMaybe<Array<Scalars['ID']>>;
  addMedia?: InputMaybe<Array<Scalars['ID']>>;
  banner?: InputMaybe<Scalars['ID']>;
  cover?: InputMaybe<Scalars['ID']>;
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['ID']>;
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  priority?: InputMaybe<Scalars['Int']>;
  profilePicture?: InputMaybe<Scalars['ID']>;
  removeContracts?: InputMaybe<Array<Scalars['ID']>>;
  removeMedia?: InputMaybe<Array<Scalars['ID']>>;
  socials?: InputMaybe<SocialsInput>;
};


export type MutationUpdateStarterpackArgs = {
  active?: InputMaybe<Scalars['Boolean']>;
  addFungibles?: InputMaybe<Array<Scalars['ID']>>;
  addFungiblesAmounts?: InputMaybe<Array<Scalars['BigInt']>>;
  addTokens?: InputMaybe<Array<Scalars['ID']>>;
  addTokensAmounts?: InputMaybe<Array<Scalars['BigInt']>>;
  call?: InputMaybe<FunctionCallInput>;
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  removeFungibles?: InputMaybe<Array<Scalars['ID']>>;
  removeTokens?: InputMaybe<Array<Scalars['ID']>>;
  starterpackId: Scalars['ID'];
};


export type MutationUploadArgs = {
  req: Array<UploadFile>;
};

/**
 * An object with an ID.
 * Follows the [Relay Global Object Identification Specification](https://relay.dev/graphql/objectidentification.htm)
 */
export type Node = {
  /** The id of the object. */
  id: Scalars['ID'];
};

export type NonFungibleTransfer = {
  __typename?: 'NonFungibleTransfer';
  amount: Scalars['BigInt'];
  from: Scalars['ID'];
  to: Scalars['ID'];
  tokenId: Scalars['BigInt'];
};

export type NumberAttribute = {
  __typename?: 'NumberAttribute';
  displayType?: Maybe<Scalars['String']>;
  traitType: Scalars['String'];
  value: Scalars['Float'];
};

/** Possible directions in which to order a list of items when provided an `orderBy` argument. */
export enum OrderDirection {
  /** Specifies an ascending order for a given `orderBy` argument. */
  Asc = 'ASC',
  /** Specifies a descending order for a given `orderBy` argument. */
  Desc = 'DESC'
}

/**
 * Information about pagination in a connection.
 * https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo
 */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['Cursor']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['Cursor']>;
};

export type Price = {
  __typename?: 'Price';
  amount?: Maybe<Scalars['String']>;
  base?: Maybe<Scalars['String']>;
  currency?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  accounts?: Maybe<AccountConnection>;
  achievement?: Maybe<Achievement>;
  achievements?: Maybe<AchievementConnection>;
  balance?: Maybe<Balance>;
  balances?: Maybe<BalanceConnection>;
  class?: Maybe<Class>;
  classes?: Maybe<ClassConnection>;
  contract?: Maybe<Contract>;
  contracts?: Maybe<ContractConnection>;
  game?: Maybe<Game>;
  games?: Maybe<GameConnection>;
  /** Fetches an object given its ID. */
  node?: Maybe<Node>;
  /** Lookup nodes by a list of IDs. */
  nodes: Array<Maybe<Node>>;
  price?: Maybe<Price>;
  quest?: Maybe<Quest>;
  questEvent?: Maybe<QuestEvent>;
  questEvents?: Maybe<QuestEventConnection>;
  quests?: Maybe<QuestConnection>;
  scope?: Maybe<Scope>;
  scopes?: Maybe<ScopeConnection>;
  starterpack?: Maybe<StarterPack>;
  starterpackEligible: Scalars['Boolean'];
  starterpacks?: Maybe<StarterPackConnection>;
  tokens: TokenConnection;
  transaction?: Maybe<Transaction>;
  transactions?: Maybe<TransactionConnection>;
};


export type QueryAccountArgs = {
  id: Scalars['ID'];
};


export type QueryAccountsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AccountOrder>;
  where?: InputMaybe<AccountWhereInput>;
};


export type QueryAchievementArgs = {
  id: Scalars['ID'];
};


export type QueryAchievementsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AchievementOrder>;
  where?: InputMaybe<AchievementWhereInput>;
};


export type QueryBalanceArgs = {
  id: Scalars['ID'];
};


export type QueryBalancesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<BalanceOrder>;
  where?: InputMaybe<BalanceWhereInput>;
};


export type QueryClassArgs = {
  id: Scalars['ID'];
};


export type QueryClassesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ClassOrder>;
  where?: InputMaybe<ClassWhereInput>;
};


export type QueryContractArgs = {
  id: Scalars['ID'];
};


export type QueryContractsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ContractOrder>;
  where?: InputMaybe<ContractWhereInput>;
};


export type QueryGameArgs = {
  id: Scalars['ID'];
};


export type QueryGamesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<GameOrder>;
  where?: InputMaybe<GameWhereInput>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
};


export type QueryNodesArgs = {
  ids: Array<Scalars['ID']>;
};


export type QueryPriceArgs = {
  base: CurrencyBase;
  quote: CurrencyQuote;
};


export type QueryQuestArgs = {
  id: Scalars['ID'];
};


export type QueryQuestEventArgs = {
  id: Scalars['ID'];
};


export type QueryQuestEventsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<QuestEventOrder>;
  where?: InputMaybe<QuestEventWhereInput>;
};


export type QueryQuestsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<QuestOrder>;
  where?: InputMaybe<QuestWhereInput>;
};


export type QueryScopeArgs = {
  id: Scalars['ID'];
};


export type QueryScopesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ScopeOrder>;
  where?: InputMaybe<ScopeWhereInput>;
};


export type QueryStarterpackArgs = {
  id: Scalars['ID'];
};


export type QueryStarterpackEligibleArgs = {
  account: Scalars['ID'];
  id: Scalars['ID'];
};


export type QueryStarterpacksArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StarterPackOrder>;
  where?: InputMaybe<StarterPackWhereInput>;
};


export type QueryTokensArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenOrder>;
  where?: InputMaybe<TokenWhereInput>;
};


export type QueryTransactionArgs = {
  id: Scalars['ID'];
};


export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransactionOrder>;
  where?: InputMaybe<TransactionWhereInput>;
};

export type Quest = Node & {
  __typename?: 'Quest';
  accountProgress?: Maybe<Array<Account>>;
  createdAt: Scalars['Time'];
  description: Scalars['String'];
  discordGuild?: Maybe<Array<DiscordGuild>>;
  eventID?: Maybe<Scalars['String']>;
  game: Game;
  id: Scalars['ID'];
  metadata?: Maybe<QuestMetadata>;
  parent?: Maybe<Quest>;
  points: Scalars['BigInt'];
  questEvents?: Maybe<Array<QuestEvent>>;
  questProgression?: Maybe<Array<AccountQuest>>;
  rewards: TokenConnection;
  subquests?: Maybe<Array<Quest>>;
  title: Scalars['String'];
  twitterQuests?: Maybe<Array<TwitterQuest>>;
};


export type QuestRewardsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenOrder>;
  where?: InputMaybe<TokenWhereInput>;
};

export type QuestCallToAction = {
  __typename?: 'QuestCallToAction';
  redirect?: Maybe<Scalars['Boolean']>;
  text?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

/** A connection to a list of items. */
export type QuestConnection = {
  __typename?: 'QuestConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<QuestEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type QuestEdge = {
  __typename?: 'QuestEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Quest>;
};

export type QuestEvent = Node & {
  __typename?: 'QuestEvent';
  accumulatedValuesTarget?: Maybe<Scalars['Long']>;
  countTarget: Scalars['Long'];
  createdAt: Scalars['Time'];
  eventSelector: Scalars['String'];
  expectedValueTarget?: Maybe<Scalars['Long']>;
  fieldSelector?: Maybe<Scalars['String']>;
  from: Contract;
  fromAddress: Scalars['ID'];
  id: Scalars['ID'];
  quest: Array<Quest>;
  type: QuestEventType;
  uniqueValuesTarget?: Maybe<Scalars['Long']>;
};

/** A connection to a list of items. */
export type QuestEventConnection = {
  __typename?: 'QuestEventConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<QuestEventEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type QuestEventEdge = {
  __typename?: 'QuestEventEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<QuestEvent>;
};

/** Ordering options for QuestEvent connections */
export type QuestEventOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order QuestEvents. */
  field: QuestEventOrderField;
};

/** Properties by which QuestEvent connections can be ordered. */
export enum QuestEventOrderField {
  CreatedAt = 'CREATED_AT'
}

/** QuestEventType is enum for the field type */
export enum QuestEventType {
  Count = 'count',
  FieldAccumulate = 'field_accumulate',
  FieldExpected = 'field_expected',
  FieldUnique = 'field_unique'
}

/**
 * QuestEventWhereInput is used for filtering QuestEvent objects.
 * Input was generated by ent.
 */
export type QuestEventWhereInput = {
  /** accumulated_values_target field predicates */
  accumulatedValuesTarget?: InputMaybe<Scalars['Long']>;
  accumulatedValuesTargetGT?: InputMaybe<Scalars['Long']>;
  accumulatedValuesTargetGTE?: InputMaybe<Scalars['Long']>;
  accumulatedValuesTargetIn?: InputMaybe<Array<Scalars['Long']>>;
  accumulatedValuesTargetIsNil?: InputMaybe<Scalars['Boolean']>;
  accumulatedValuesTargetLT?: InputMaybe<Scalars['Long']>;
  accumulatedValuesTargetLTE?: InputMaybe<Scalars['Long']>;
  accumulatedValuesTargetNEQ?: InputMaybe<Scalars['Long']>;
  accumulatedValuesTargetNotIn?: InputMaybe<Array<Scalars['Long']>>;
  accumulatedValuesTargetNotNil?: InputMaybe<Scalars['Boolean']>;
  and?: InputMaybe<Array<QuestEventWhereInput>>;
  /** count_target field predicates */
  countTarget?: InputMaybe<Scalars['Long']>;
  countTargetGT?: InputMaybe<Scalars['Long']>;
  countTargetGTE?: InputMaybe<Scalars['Long']>;
  countTargetIn?: InputMaybe<Array<Scalars['Long']>>;
  countTargetLT?: InputMaybe<Scalars['Long']>;
  countTargetLTE?: InputMaybe<Scalars['Long']>;
  countTargetNEQ?: InputMaybe<Scalars['Long']>;
  countTargetNotIn?: InputMaybe<Array<Scalars['Long']>>;
  /** created_at field predicates */
  createdAt?: InputMaybe<Scalars['Time']>;
  createdAtGT?: InputMaybe<Scalars['Time']>;
  createdAtGTE?: InputMaybe<Scalars['Time']>;
  createdAtIn?: InputMaybe<Array<Scalars['Time']>>;
  createdAtLT?: InputMaybe<Scalars['Time']>;
  createdAtLTE?: InputMaybe<Scalars['Time']>;
  createdAtNEQ?: InputMaybe<Scalars['Time']>;
  createdAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** event_selector field predicates */
  eventSelector?: InputMaybe<Scalars['String']>;
  eventSelectorContains?: InputMaybe<Scalars['String']>;
  eventSelectorContainsFold?: InputMaybe<Scalars['String']>;
  eventSelectorEqualFold?: InputMaybe<Scalars['String']>;
  eventSelectorGT?: InputMaybe<Scalars['String']>;
  eventSelectorGTE?: InputMaybe<Scalars['String']>;
  eventSelectorHasPrefix?: InputMaybe<Scalars['String']>;
  eventSelectorHasSuffix?: InputMaybe<Scalars['String']>;
  eventSelectorIn?: InputMaybe<Array<Scalars['String']>>;
  eventSelectorLT?: InputMaybe<Scalars['String']>;
  eventSelectorLTE?: InputMaybe<Scalars['String']>;
  eventSelectorNEQ?: InputMaybe<Scalars['String']>;
  eventSelectorNotIn?: InputMaybe<Array<Scalars['String']>>;
  /** expected_value_target field predicates */
  expectedValueTarget?: InputMaybe<Scalars['Long']>;
  expectedValueTargetGT?: InputMaybe<Scalars['Long']>;
  expectedValueTargetGTE?: InputMaybe<Scalars['Long']>;
  expectedValueTargetIn?: InputMaybe<Array<Scalars['Long']>>;
  expectedValueTargetIsNil?: InputMaybe<Scalars['Boolean']>;
  expectedValueTargetLT?: InputMaybe<Scalars['Long']>;
  expectedValueTargetLTE?: InputMaybe<Scalars['Long']>;
  expectedValueTargetNEQ?: InputMaybe<Scalars['Long']>;
  expectedValueTargetNotIn?: InputMaybe<Array<Scalars['Long']>>;
  expectedValueTargetNotNil?: InputMaybe<Scalars['Boolean']>;
  /** field_selector field predicates */
  fieldSelector?: InputMaybe<Scalars['String']>;
  fieldSelectorContains?: InputMaybe<Scalars['String']>;
  fieldSelectorContainsFold?: InputMaybe<Scalars['String']>;
  fieldSelectorEqualFold?: InputMaybe<Scalars['String']>;
  fieldSelectorGT?: InputMaybe<Scalars['String']>;
  fieldSelectorGTE?: InputMaybe<Scalars['String']>;
  fieldSelectorHasPrefix?: InputMaybe<Scalars['String']>;
  fieldSelectorHasSuffix?: InputMaybe<Scalars['String']>;
  fieldSelectorIn?: InputMaybe<Array<Scalars['String']>>;
  fieldSelectorIsNil?: InputMaybe<Scalars['Boolean']>;
  fieldSelectorLT?: InputMaybe<Scalars['String']>;
  fieldSelectorLTE?: InputMaybe<Scalars['String']>;
  fieldSelectorNEQ?: InputMaybe<Scalars['String']>;
  fieldSelectorNotIn?: InputMaybe<Array<Scalars['String']>>;
  fieldSelectorNotNil?: InputMaybe<Scalars['Boolean']>;
  /** from_address field predicates */
  fromAddress?: InputMaybe<Scalars['ID']>;
  fromAddressContains?: InputMaybe<Scalars['ID']>;
  fromAddressContainsFold?: InputMaybe<Scalars['ID']>;
  fromAddressEqualFold?: InputMaybe<Scalars['ID']>;
  fromAddressGT?: InputMaybe<Scalars['ID']>;
  fromAddressGTE?: InputMaybe<Scalars['ID']>;
  fromAddressHasPrefix?: InputMaybe<Scalars['ID']>;
  fromAddressHasSuffix?: InputMaybe<Scalars['ID']>;
  fromAddressIn?: InputMaybe<Array<Scalars['ID']>>;
  fromAddressLT?: InputMaybe<Scalars['ID']>;
  fromAddressLTE?: InputMaybe<Scalars['ID']>;
  fromAddressNEQ?: InputMaybe<Scalars['ID']>;
  fromAddressNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** from edge predicates */
  hasFrom?: InputMaybe<Scalars['Boolean']>;
  hasFromWith?: InputMaybe<Array<ContractWhereInput>>;
  /** quest edge predicates */
  hasQuest?: InputMaybe<Scalars['Boolean']>;
  hasQuestWith?: InputMaybe<Array<QuestWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<QuestEventWhereInput>;
  or?: InputMaybe<Array<QuestEventWhereInput>>;
  /** type field predicates */
  type?: InputMaybe<QuestEventType>;
  typeIn?: InputMaybe<Array<QuestEventType>>;
  typeNEQ?: InputMaybe<QuestEventType>;
  typeNotIn?: InputMaybe<Array<QuestEventType>>;
  /** unique_values_target field predicates */
  uniqueValuesTarget?: InputMaybe<Scalars['Long']>;
  uniqueValuesTargetGT?: InputMaybe<Scalars['Long']>;
  uniqueValuesTargetGTE?: InputMaybe<Scalars['Long']>;
  uniqueValuesTargetIn?: InputMaybe<Array<Scalars['Long']>>;
  uniqueValuesTargetIsNil?: InputMaybe<Scalars['Boolean']>;
  uniqueValuesTargetLT?: InputMaybe<Scalars['Long']>;
  uniqueValuesTargetLTE?: InputMaybe<Scalars['Long']>;
  uniqueValuesTargetNEQ?: InputMaybe<Scalars['Long']>;
  uniqueValuesTargetNotIn?: InputMaybe<Array<Scalars['Long']>>;
  uniqueValuesTargetNotNil?: InputMaybe<Scalars['Boolean']>;
};

export type QuestMetadata = {
  __typename?: 'QuestMetadata';
  callToAction?: Maybe<QuestCallToAction>;
};

/** Ordering options for Quest connections */
export type QuestOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Quests. */
  field: QuestOrderField;
};

/** Properties by which Quest connections can be ordered. */
export enum QuestOrderField {
  CreatedAt = 'CREATED_AT'
}

/**
 * QuestWhereInput is used for filtering Quest objects.
 * Input was generated by ent.
 */
export type QuestWhereInput = {
  and?: InputMaybe<Array<QuestWhereInput>>;
  /** created_at field predicates */
  createdAt?: InputMaybe<Scalars['Time']>;
  createdAtGT?: InputMaybe<Scalars['Time']>;
  createdAtGTE?: InputMaybe<Scalars['Time']>;
  createdAtIn?: InputMaybe<Array<Scalars['Time']>>;
  createdAtLT?: InputMaybe<Scalars['Time']>;
  createdAtLTE?: InputMaybe<Scalars['Time']>;
  createdAtNEQ?: InputMaybe<Scalars['Time']>;
  createdAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** description field predicates */
  description?: InputMaybe<Scalars['String']>;
  descriptionContains?: InputMaybe<Scalars['String']>;
  descriptionContainsFold?: InputMaybe<Scalars['String']>;
  descriptionEqualFold?: InputMaybe<Scalars['String']>;
  descriptionGT?: InputMaybe<Scalars['String']>;
  descriptionGTE?: InputMaybe<Scalars['String']>;
  descriptionHasPrefix?: InputMaybe<Scalars['String']>;
  descriptionHasSuffix?: InputMaybe<Scalars['String']>;
  descriptionIn?: InputMaybe<Array<Scalars['String']>>;
  descriptionLT?: InputMaybe<Scalars['String']>;
  descriptionLTE?: InputMaybe<Scalars['String']>;
  descriptionNEQ?: InputMaybe<Scalars['String']>;
  descriptionNotIn?: InputMaybe<Array<Scalars['String']>>;
  /** event_id field predicates */
  eventID?: InputMaybe<Scalars['String']>;
  eventIDContains?: InputMaybe<Scalars['String']>;
  eventIDContainsFold?: InputMaybe<Scalars['String']>;
  eventIDEqualFold?: InputMaybe<Scalars['String']>;
  eventIDGT?: InputMaybe<Scalars['String']>;
  eventIDGTE?: InputMaybe<Scalars['String']>;
  eventIDHasPrefix?: InputMaybe<Scalars['String']>;
  eventIDHasSuffix?: InputMaybe<Scalars['String']>;
  eventIDIn?: InputMaybe<Array<Scalars['String']>>;
  eventIDIsNil?: InputMaybe<Scalars['Boolean']>;
  eventIDLT?: InputMaybe<Scalars['String']>;
  eventIDLTE?: InputMaybe<Scalars['String']>;
  eventIDNEQ?: InputMaybe<Scalars['String']>;
  eventIDNotIn?: InputMaybe<Array<Scalars['String']>>;
  eventIDNotNil?: InputMaybe<Scalars['Boolean']>;
  /** account_progress edge predicates */
  hasAccountProgress?: InputMaybe<Scalars['Boolean']>;
  hasAccountProgressWith?: InputMaybe<Array<AccountWhereInput>>;
  /** discord_guild edge predicates */
  hasDiscordGuild?: InputMaybe<Scalars['Boolean']>;
  hasDiscordGuildWith?: InputMaybe<Array<DiscordGuildWhereInput>>;
  /** game edge predicates */
  hasGame?: InputMaybe<Scalars['Boolean']>;
  hasGameWith?: InputMaybe<Array<GameWhereInput>>;
  /** parent edge predicates */
  hasParent?: InputMaybe<Scalars['Boolean']>;
  hasParentWith?: InputMaybe<Array<QuestWhereInput>>;
  /** quest_events edge predicates */
  hasQuestEvents?: InputMaybe<Scalars['Boolean']>;
  hasQuestEventsWith?: InputMaybe<Array<QuestEventWhereInput>>;
  /** quest_progression edge predicates */
  hasQuestProgression?: InputMaybe<Scalars['Boolean']>;
  hasQuestProgressionWith?: InputMaybe<Array<AccountQuestWhereInput>>;
  /** rewards edge predicates */
  hasRewards?: InputMaybe<Scalars['Boolean']>;
  hasRewardsWith?: InputMaybe<Array<TokenWhereInput>>;
  /** subquests edge predicates */
  hasSubquests?: InputMaybe<Scalars['Boolean']>;
  hasSubquestsWith?: InputMaybe<Array<QuestWhereInput>>;
  /** twitter_quests edge predicates */
  hasTwitterQuests?: InputMaybe<Scalars['Boolean']>;
  hasTwitterQuestsWith?: InputMaybe<Array<TwitterQuestWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<QuestWhereInput>;
  or?: InputMaybe<Array<QuestWhereInput>>;
  /** points field predicates */
  points?: InputMaybe<Scalars['BigInt']>;
  pointsGT?: InputMaybe<Scalars['BigInt']>;
  pointsGTE?: InputMaybe<Scalars['BigInt']>;
  pointsIn?: InputMaybe<Array<Scalars['BigInt']>>;
  pointsLT?: InputMaybe<Scalars['BigInt']>;
  pointsLTE?: InputMaybe<Scalars['BigInt']>;
  pointsNEQ?: InputMaybe<Scalars['BigInt']>;
  pointsNotIn?: InputMaybe<Array<Scalars['BigInt']>>;
  /** title field predicates */
  title?: InputMaybe<Scalars['String']>;
  titleContains?: InputMaybe<Scalars['String']>;
  titleContainsFold?: InputMaybe<Scalars['String']>;
  titleEqualFold?: InputMaybe<Scalars['String']>;
  titleGT?: InputMaybe<Scalars['String']>;
  titleGTE?: InputMaybe<Scalars['String']>;
  titleHasPrefix?: InputMaybe<Scalars['String']>;
  titleHasSuffix?: InputMaybe<Scalars['String']>;
  titleIn?: InputMaybe<Array<Scalars['String']>>;
  titleLT?: InputMaybe<Scalars['String']>;
  titleLTE?: InputMaybe<Scalars['String']>;
  titleNEQ?: InputMaybe<Scalars['String']>;
  titleNotIn?: InputMaybe<Array<Scalars['String']>>;
};

export type Requirement = {
  __typename?: 'Requirement';
  constraint: Constraint;
  roleID: Scalars['String'];
};

export enum Role {
  Admin = 'ADMIN'
}

export type Scope = Node & {
  __typename?: 'Scope';
  contract: Contract;
  createdAt: Scalars['Time'];
  description?: Maybe<Scalars['String']>;
  games: GameConnection;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  selector: Scalars['String'];
  target: Scalars['ID'];
  updatedAt: Scalars['Time'];
};


export type ScopeGamesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<GameOrder>;
  where?: InputMaybe<GameWhereInput>;
};

/** A connection to a list of items. */
export type ScopeConnection = {
  __typename?: 'ScopeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ScopeEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type ScopeEdge = {
  __typename?: 'ScopeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Scope>;
};

export type ScopeInput = {
  description: Scalars['String'];
  name: Scalars['String'];
  selector: Scalars['String'];
  target: Scalars['String'];
};

/** Ordering options for Scope connections */
export type ScopeOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Scopes. */
  field: ScopeOrderField;
};

/** Properties by which Scope connections can be ordered. */
export enum ScopeOrderField {
  CreatedAt = 'CREATED_AT'
}

/**
 * ScopeWhereInput is used for filtering Scope objects.
 * Input was generated by ent.
 */
export type ScopeWhereInput = {
  and?: InputMaybe<Array<ScopeWhereInput>>;
  /** created_at field predicates */
  createdAt?: InputMaybe<Scalars['Time']>;
  createdAtGT?: InputMaybe<Scalars['Time']>;
  createdAtGTE?: InputMaybe<Scalars['Time']>;
  createdAtIn?: InputMaybe<Array<Scalars['Time']>>;
  createdAtLT?: InputMaybe<Scalars['Time']>;
  createdAtLTE?: InputMaybe<Scalars['Time']>;
  createdAtNEQ?: InputMaybe<Scalars['Time']>;
  createdAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** description field predicates */
  description?: InputMaybe<Scalars['String']>;
  descriptionContains?: InputMaybe<Scalars['String']>;
  descriptionContainsFold?: InputMaybe<Scalars['String']>;
  descriptionEqualFold?: InputMaybe<Scalars['String']>;
  descriptionGT?: InputMaybe<Scalars['String']>;
  descriptionGTE?: InputMaybe<Scalars['String']>;
  descriptionHasPrefix?: InputMaybe<Scalars['String']>;
  descriptionHasSuffix?: InputMaybe<Scalars['String']>;
  descriptionIn?: InputMaybe<Array<Scalars['String']>>;
  descriptionIsNil?: InputMaybe<Scalars['Boolean']>;
  descriptionLT?: InputMaybe<Scalars['String']>;
  descriptionLTE?: InputMaybe<Scalars['String']>;
  descriptionNEQ?: InputMaybe<Scalars['String']>;
  descriptionNotIn?: InputMaybe<Array<Scalars['String']>>;
  descriptionNotNil?: InputMaybe<Scalars['Boolean']>;
  /** contract edge predicates */
  hasContract?: InputMaybe<Scalars['Boolean']>;
  hasContractWith?: InputMaybe<Array<ContractWhereInput>>;
  /** games edge predicates */
  hasGames?: InputMaybe<Scalars['Boolean']>;
  hasGamesWith?: InputMaybe<Array<GameWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** name field predicates */
  name?: InputMaybe<Scalars['String']>;
  nameContains?: InputMaybe<Scalars['String']>;
  nameContainsFold?: InputMaybe<Scalars['String']>;
  nameEqualFold?: InputMaybe<Scalars['String']>;
  nameGT?: InputMaybe<Scalars['String']>;
  nameGTE?: InputMaybe<Scalars['String']>;
  nameHasPrefix?: InputMaybe<Scalars['String']>;
  nameHasSuffix?: InputMaybe<Scalars['String']>;
  nameIn?: InputMaybe<Array<Scalars['String']>>;
  nameIsNil?: InputMaybe<Scalars['Boolean']>;
  nameLT?: InputMaybe<Scalars['String']>;
  nameLTE?: InputMaybe<Scalars['String']>;
  nameNEQ?: InputMaybe<Scalars['String']>;
  nameNotIn?: InputMaybe<Array<Scalars['String']>>;
  nameNotNil?: InputMaybe<Scalars['Boolean']>;
  not?: InputMaybe<ScopeWhereInput>;
  or?: InputMaybe<Array<ScopeWhereInput>>;
  /** selector field predicates */
  selector?: InputMaybe<Scalars['String']>;
  selectorContains?: InputMaybe<Scalars['String']>;
  selectorContainsFold?: InputMaybe<Scalars['String']>;
  selectorEqualFold?: InputMaybe<Scalars['String']>;
  selectorGT?: InputMaybe<Scalars['String']>;
  selectorGTE?: InputMaybe<Scalars['String']>;
  selectorHasPrefix?: InputMaybe<Scalars['String']>;
  selectorHasSuffix?: InputMaybe<Scalars['String']>;
  selectorIn?: InputMaybe<Array<Scalars['String']>>;
  selectorLT?: InputMaybe<Scalars['String']>;
  selectorLTE?: InputMaybe<Scalars['String']>;
  selectorNEQ?: InputMaybe<Scalars['String']>;
  selectorNotIn?: InputMaybe<Array<Scalars['String']>>;
  /** target field predicates */
  target?: InputMaybe<Scalars['ID']>;
  targetContains?: InputMaybe<Scalars['ID']>;
  targetContainsFold?: InputMaybe<Scalars['ID']>;
  targetEqualFold?: InputMaybe<Scalars['ID']>;
  targetGT?: InputMaybe<Scalars['ID']>;
  targetGTE?: InputMaybe<Scalars['ID']>;
  targetHasPrefix?: InputMaybe<Scalars['ID']>;
  targetHasSuffix?: InputMaybe<Scalars['ID']>;
  targetIn?: InputMaybe<Array<Scalars['ID']>>;
  targetLT?: InputMaybe<Scalars['ID']>;
  targetLTE?: InputMaybe<Scalars['ID']>;
  targetNEQ?: InputMaybe<Scalars['ID']>;
  targetNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** updated_at field predicates */
  updatedAt?: InputMaybe<Scalars['Time']>;
  updatedAtGT?: InputMaybe<Scalars['Time']>;
  updatedAtGTE?: InputMaybe<Scalars['Time']>;
  updatedAtIn?: InputMaybe<Array<Scalars['Time']>>;
  updatedAtLT?: InputMaybe<Scalars['Time']>;
  updatedAtLTE?: InputMaybe<Scalars['Time']>;
  updatedAtNEQ?: InputMaybe<Scalars['Time']>;
  updatedAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
};

export type Socials = {
  __typename?: 'Socials';
  discord?: Maybe<Scalars['String']>;
  twitter?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

export type SocialsInput = {
  discord?: InputMaybe<Scalars['String']>;
  twitter?: InputMaybe<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
};

export type StarterPack = Node & {
  __typename?: 'StarterPack';
  accountStarterPack: AccountStarterPackConnection;
  accounts: AccountConnection;
  active: Scalars['Boolean'];
  createdAt: Scalars['Time'];
  description?: Maybe<Scalars['String']>;
  fungibles?: Maybe<Array<Contract>>;
  game?: Maybe<Game>;
  id: Scalars['ID'];
  issuance?: Maybe<Scalars['Int']>;
  maxIssuance?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  prerequisitesQuests?: Maybe<Array<Quest>>;
  starterPackFungibles?: Maybe<Array<StarterPackContract>>;
  starterPackTokens?: Maybe<Array<StarterPackToken>>;
  tokens?: Maybe<Array<Token>>;
};


export type StarterPackAccountStarterPackArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<AccountStarterPackWhereInput>;
};


export type StarterPackAccountsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AccountOrder>;
  where?: InputMaybe<AccountWhereInput>;
};

/** A connection to a list of items. */
export type StarterPackConnection = {
  __typename?: 'StarterPackConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<StarterPackEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

export type StarterPackContract = Node & {
  __typename?: 'StarterPackContract';
  amount?: Maybe<Scalars['BigInt']>;
  contract: Contract;
  contractID: Scalars['ID'];
  id: Scalars['ID'];
  starterPack: StarterPack;
  starterPackID: Scalars['ID'];
};

/**
 * StarterPackContractWhereInput is used for filtering StarterPackContract objects.
 * Input was generated by ent.
 */
export type StarterPackContractWhereInput = {
  /** amount field predicates */
  amount?: InputMaybe<Scalars['BigInt']>;
  amountGT?: InputMaybe<Scalars['BigInt']>;
  amountGTE?: InputMaybe<Scalars['BigInt']>;
  amountIn?: InputMaybe<Array<Scalars['BigInt']>>;
  amountIsNil?: InputMaybe<Scalars['Boolean']>;
  amountLT?: InputMaybe<Scalars['BigInt']>;
  amountLTE?: InputMaybe<Scalars['BigInt']>;
  amountNEQ?: InputMaybe<Scalars['BigInt']>;
  amountNotIn?: InputMaybe<Array<Scalars['BigInt']>>;
  amountNotNil?: InputMaybe<Scalars['Boolean']>;
  and?: InputMaybe<Array<StarterPackContractWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<StarterPackContractWhereInput>;
  or?: InputMaybe<Array<StarterPackContractWhereInput>>;
};

/** An edge in a connection. */
export type StarterPackEdge = {
  __typename?: 'StarterPackEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<StarterPack>;
};

/** Ordering options for StarterPack connections */
export type StarterPackOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order StarterPacks. */
  field: StarterPackOrderField;
};

/** Properties by which StarterPack connections can be ordered. */
export enum StarterPackOrderField {
  CreatedAt = 'CREATED_AT'
}

export type StarterPackToken = Node & {
  __typename?: 'StarterPackToken';
  amount?: Maybe<Scalars['BigInt']>;
  id: Scalars['ID'];
  starterPack: StarterPack;
  starterPackID: Scalars['ID'];
  token: Token;
  tokenID: Scalars['ID'];
};

/**
 * StarterPackTokenWhereInput is used for filtering StarterPackToken objects.
 * Input was generated by ent.
 */
export type StarterPackTokenWhereInput = {
  /** amount field predicates */
  amount?: InputMaybe<Scalars['BigInt']>;
  amountGT?: InputMaybe<Scalars['BigInt']>;
  amountGTE?: InputMaybe<Scalars['BigInt']>;
  amountIn?: InputMaybe<Array<Scalars['BigInt']>>;
  amountIsNil?: InputMaybe<Scalars['Boolean']>;
  amountLT?: InputMaybe<Scalars['BigInt']>;
  amountLTE?: InputMaybe<Scalars['BigInt']>;
  amountNEQ?: InputMaybe<Scalars['BigInt']>;
  amountNotIn?: InputMaybe<Array<Scalars['BigInt']>>;
  amountNotNil?: InputMaybe<Scalars['Boolean']>;
  and?: InputMaybe<Array<StarterPackTokenWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<StarterPackTokenWhereInput>;
  or?: InputMaybe<Array<StarterPackTokenWhereInput>>;
};

/**
 * StarterPackWhereInput is used for filtering StarterPack objects.
 * Input was generated by ent.
 */
export type StarterPackWhereInput = {
  /** active field predicates */
  active?: InputMaybe<Scalars['Boolean']>;
  activeNEQ?: InputMaybe<Scalars['Boolean']>;
  and?: InputMaybe<Array<StarterPackWhereInput>>;
  /** created_at field predicates */
  createdAt?: InputMaybe<Scalars['Time']>;
  createdAtGT?: InputMaybe<Scalars['Time']>;
  createdAtGTE?: InputMaybe<Scalars['Time']>;
  createdAtIn?: InputMaybe<Array<Scalars['Time']>>;
  createdAtLT?: InputMaybe<Scalars['Time']>;
  createdAtLTE?: InputMaybe<Scalars['Time']>;
  createdAtNEQ?: InputMaybe<Scalars['Time']>;
  createdAtNotIn?: InputMaybe<Array<Scalars['Time']>>;
  /** description field predicates */
  description?: InputMaybe<Scalars['String']>;
  descriptionContains?: InputMaybe<Scalars['String']>;
  descriptionContainsFold?: InputMaybe<Scalars['String']>;
  descriptionEqualFold?: InputMaybe<Scalars['String']>;
  descriptionGT?: InputMaybe<Scalars['String']>;
  descriptionGTE?: InputMaybe<Scalars['String']>;
  descriptionHasPrefix?: InputMaybe<Scalars['String']>;
  descriptionHasSuffix?: InputMaybe<Scalars['String']>;
  descriptionIn?: InputMaybe<Array<Scalars['String']>>;
  descriptionIsNil?: InputMaybe<Scalars['Boolean']>;
  descriptionLT?: InputMaybe<Scalars['String']>;
  descriptionLTE?: InputMaybe<Scalars['String']>;
  descriptionNEQ?: InputMaybe<Scalars['String']>;
  descriptionNotIn?: InputMaybe<Array<Scalars['String']>>;
  descriptionNotNil?: InputMaybe<Scalars['Boolean']>;
  /** account_starter_pack edge predicates */
  hasAccountStarterPack?: InputMaybe<Scalars['Boolean']>;
  hasAccountStarterPackWith?: InputMaybe<Array<AccountStarterPackWhereInput>>;
  /** accounts edge predicates */
  hasAccounts?: InputMaybe<Scalars['Boolean']>;
  hasAccountsWith?: InputMaybe<Array<AccountWhereInput>>;
  /** fungibles edge predicates */
  hasFungibles?: InputMaybe<Scalars['Boolean']>;
  hasFungiblesWith?: InputMaybe<Array<ContractWhereInput>>;
  /** game edge predicates */
  hasGame?: InputMaybe<Scalars['Boolean']>;
  hasGameWith?: InputMaybe<Array<GameWhereInput>>;
  /** prerequisites_quests edge predicates */
  hasPrerequisitesQuests?: InputMaybe<Scalars['Boolean']>;
  hasPrerequisitesQuestsWith?: InputMaybe<Array<QuestWhereInput>>;
  /** starter_pack_fungibles edge predicates */
  hasStarterPackFungibles?: InputMaybe<Scalars['Boolean']>;
  hasStarterPackFungiblesWith?: InputMaybe<Array<StarterPackContractWhereInput>>;
  /** starter_pack_tokens edge predicates */
  hasStarterPackTokens?: InputMaybe<Scalars['Boolean']>;
  hasStarterPackTokensWith?: InputMaybe<Array<StarterPackTokenWhereInput>>;
  /** tokens edge predicates */
  hasTokens?: InputMaybe<Scalars['Boolean']>;
  hasTokensWith?: InputMaybe<Array<TokenWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** issuance field predicates */
  issuance?: InputMaybe<Scalars['Int']>;
  issuanceGT?: InputMaybe<Scalars['Int']>;
  issuanceGTE?: InputMaybe<Scalars['Int']>;
  issuanceIn?: InputMaybe<Array<Scalars['Int']>>;
  issuanceIsNil?: InputMaybe<Scalars['Boolean']>;
  issuanceLT?: InputMaybe<Scalars['Int']>;
  issuanceLTE?: InputMaybe<Scalars['Int']>;
  issuanceNEQ?: InputMaybe<Scalars['Int']>;
  issuanceNotIn?: InputMaybe<Array<Scalars['Int']>>;
  issuanceNotNil?: InputMaybe<Scalars['Boolean']>;
  /** max_issuance field predicates */
  maxIssuance?: InputMaybe<Scalars['Int']>;
  maxIssuanceGT?: InputMaybe<Scalars['Int']>;
  maxIssuanceGTE?: InputMaybe<Scalars['Int']>;
  maxIssuanceIn?: InputMaybe<Array<Scalars['Int']>>;
  maxIssuanceIsNil?: InputMaybe<Scalars['Boolean']>;
  maxIssuanceLT?: InputMaybe<Scalars['Int']>;
  maxIssuanceLTE?: InputMaybe<Scalars['Int']>;
  maxIssuanceNEQ?: InputMaybe<Scalars['Int']>;
  maxIssuanceNotIn?: InputMaybe<Array<Scalars['Int']>>;
  maxIssuanceNotNil?: InputMaybe<Scalars['Boolean']>;
  /** name field predicates */
  name?: InputMaybe<Scalars['String']>;
  nameContains?: InputMaybe<Scalars['String']>;
  nameContainsFold?: InputMaybe<Scalars['String']>;
  nameEqualFold?: InputMaybe<Scalars['String']>;
  nameGT?: InputMaybe<Scalars['String']>;
  nameGTE?: InputMaybe<Scalars['String']>;
  nameHasPrefix?: InputMaybe<Scalars['String']>;
  nameHasSuffix?: InputMaybe<Scalars['String']>;
  nameIn?: InputMaybe<Array<Scalars['String']>>;
  nameIsNil?: InputMaybe<Scalars['Boolean']>;
  nameLT?: InputMaybe<Scalars['String']>;
  nameLTE?: InputMaybe<Scalars['String']>;
  nameNEQ?: InputMaybe<Scalars['String']>;
  nameNotIn?: InputMaybe<Array<Scalars['String']>>;
  nameNotNil?: InputMaybe<Scalars['Boolean']>;
  not?: InputMaybe<StarterPackWhereInput>;
  or?: InputMaybe<Array<StarterPackWhereInput>>;
};

export type StringAttribute = {
  __typename?: 'StringAttribute';
  displayType?: Maybe<Scalars['String']>;
  traitType: Scalars['String'];
  value: Scalars['String'];
};

export type Token = Node & {
  __typename?: 'Token';
  contract: Contract;
  holders: BalanceConnection;
  id: Scalars['ID'];
  image?: Maybe<File>;
  metadata?: Maybe<Metadata>;
  quests: QuestConnection;
  starterPackTokens?: Maybe<Array<StarterPackToken>>;
  starterPacks?: Maybe<Array<StarterPack>>;
  thumbnail?: Maybe<File>;
  tokenID: Scalars['BigInt'];
  tokenURI?: Maybe<Scalars['String']>;
};


export type TokenHoldersArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<BalanceOrder>;
  where?: InputMaybe<BalanceWhereInput>;
};


export type TokenQuestsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<QuestOrder>;
  where?: InputMaybe<QuestWhereInput>;
};

/** A connection to a list of items. */
export type TokenConnection = {
  __typename?: 'TokenConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TokenEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type TokenEdge = {
  __typename?: 'TokenEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Token>;
};

/** Ordering options for Token connections */
export type TokenOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Tokens. */
  field: TokenOrderField;
};

/** Properties by which Token connections can be ordered. */
export enum TokenOrderField {
  TokenId = 'TOKEN_ID'
}

export type TokenRequirements = {
  __typename?: 'TokenRequirements';
  contractAddress: Scalars['String'];
  requirements: Array<Requirement>;
};

/**
 * TokenWhereInput is used for filtering Token objects.
 * Input was generated by ent.
 */
export type TokenWhereInput = {
  and?: InputMaybe<Array<TokenWhereInput>>;
  /** contract edge predicates */
  hasContract?: InputMaybe<Scalars['Boolean']>;
  hasContractWith?: InputMaybe<Array<ContractWhereInput>>;
  /** holders edge predicates */
  hasHolders?: InputMaybe<Scalars['Boolean']>;
  hasHoldersWith?: InputMaybe<Array<BalanceWhereInput>>;
  /** image edge predicates */
  hasImage?: InputMaybe<Scalars['Boolean']>;
  hasImageWith?: InputMaybe<Array<FileWhereInput>>;
  /** quests edge predicates */
  hasQuests?: InputMaybe<Scalars['Boolean']>;
  hasQuestsWith?: InputMaybe<Array<QuestWhereInput>>;
  /** starter_pack_tokens edge predicates */
  hasStarterPackTokens?: InputMaybe<Scalars['Boolean']>;
  hasStarterPackTokensWith?: InputMaybe<Array<StarterPackTokenWhereInput>>;
  /** starter_packs edge predicates */
  hasStarterPacks?: InputMaybe<Scalars['Boolean']>;
  hasStarterPacksWith?: InputMaybe<Array<StarterPackWhereInput>>;
  /** thumbnail edge predicates */
  hasThumbnail?: InputMaybe<Scalars['Boolean']>;
  hasThumbnailWith?: InputMaybe<Array<FileWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<TokenWhereInput>;
  or?: InputMaybe<Array<TokenWhereInput>>;
  /** token_id field predicates */
  tokenID?: InputMaybe<Scalars['BigInt']>;
  tokenIDGT?: InputMaybe<Scalars['BigInt']>;
  tokenIDGTE?: InputMaybe<Scalars['BigInt']>;
  tokenIDIn?: InputMaybe<Array<Scalars['BigInt']>>;
  tokenIDLT?: InputMaybe<Scalars['BigInt']>;
  tokenIDLTE?: InputMaybe<Scalars['BigInt']>;
  tokenIDNEQ?: InputMaybe<Scalars['BigInt']>;
  tokenIDNotIn?: InputMaybe<Array<Scalars['BigInt']>>;
  /** token_uri field predicates */
  tokenURI?: InputMaybe<Scalars['String']>;
  tokenURIContains?: InputMaybe<Scalars['String']>;
  tokenURIContainsFold?: InputMaybe<Scalars['String']>;
  tokenURIEqualFold?: InputMaybe<Scalars['String']>;
  tokenURIGT?: InputMaybe<Scalars['String']>;
  tokenURIGTE?: InputMaybe<Scalars['String']>;
  tokenURIHasPrefix?: InputMaybe<Scalars['String']>;
  tokenURIHasSuffix?: InputMaybe<Scalars['String']>;
  tokenURIIn?: InputMaybe<Array<Scalars['String']>>;
  tokenURIIsNil?: InputMaybe<Scalars['Boolean']>;
  tokenURILT?: InputMaybe<Scalars['String']>;
  tokenURILTE?: InputMaybe<Scalars['String']>;
  tokenURINEQ?: InputMaybe<Scalars['String']>;
  tokenURINotIn?: InputMaybe<Array<Scalars['String']>>;
  tokenURINotNil?: InputMaybe<Scalars['Boolean']>;
};

export type Transaction = Node & {
  __typename?: 'Transaction';
  block?: Maybe<Block>;
  blockID?: Maybe<Scalars['ID']>;
  calldata?: Maybe<Array<Scalars['String']>>;
  contract: Contract;
  contractID: Scalars['ID'];
  deployedContract?: Maybe<Contract>;
  entryPointSelector?: Maybe<Scalars['String']>;
  events?: Maybe<Array<Event>>;
  executorID?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  metadata?: Maybe<TransactionMetadata>;
  nonce?: Maybe<Scalars['String']>;
  questClaims?: Maybe<Array<AccountQuest>>;
  receipt?: Maybe<TransactionReceipt>;
  signature?: Maybe<Array<Scalars['String']>>;
  starterPackClaims?: Maybe<Array<AccountStarterPack>>;
  to?: Maybe<Array<Contract>>;
  transactionHash: Scalars['String'];
};

/** A connection to a list of items. */
export type TransactionConnection = {
  __typename?: 'TransactionConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TransactionEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type TransactionEdge = {
  __typename?: 'TransactionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<Transaction>;
};

export type TransactionMetadata = AccountUpgrade | ContractDeploy | FungibleTransfer | Mint | NonFungibleTransfer;

/** Ordering options for Transaction connections */
export type TransactionOrder = {
  /** The ordering direction. */
  direction?: OrderDirection;
  /** The field by which to order Transactions. */
  field: TransactionOrderField;
};

/** Properties by which Transaction connections can be ordered. */
export enum TransactionOrderField {
  Nonce = 'NONCE'
}

export type TransactionReceipt = Node & {
  __typename?: 'TransactionReceipt';
  block?: Maybe<Block>;
  id: Scalars['ID'];
  l1OriginMessage: L2Message;
  messagesSent: Array<Maybe<L1Message>>;
  status: TransactionReceiptStatus;
  statusData: Scalars['String'];
  transaction: Transaction;
  transactionHash: Scalars['String'];
};

/** A connection to a list of items. */
export type TransactionReceiptConnection = {
  __typename?: 'TransactionReceiptConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TransactionReceiptEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type TransactionReceiptEdge = {
  __typename?: 'TransactionReceiptEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<TransactionReceipt>;
};

/** TransactionReceiptStatus is enum for the field status */
export enum TransactionReceiptStatus {
  AcceptedOnL1 = 'ACCEPTED_ON_L1',
  AcceptedOnL2 = 'ACCEPTED_ON_L2',
  Pending = 'PENDING',
  Received = 'RECEIVED',
  Rejected = 'REJECTED',
  Unknown = 'UNKNOWN'
}

/**
 * TransactionReceiptWhereInput is used for filtering TransactionReceipt objects.
 * Input was generated by ent.
 */
export type TransactionReceiptWhereInput = {
  and?: InputMaybe<Array<TransactionReceiptWhereInput>>;
  /** block edge predicates */
  hasBlock?: InputMaybe<Scalars['Boolean']>;
  hasBlockWith?: InputMaybe<Array<BlockWhereInput>>;
  /** transaction edge predicates */
  hasTransaction?: InputMaybe<Scalars['Boolean']>;
  hasTransactionWith?: InputMaybe<Array<TransactionWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<TransactionReceiptWhereInput>;
  or?: InputMaybe<Array<TransactionReceiptWhereInput>>;
  /** status field predicates */
  status?: InputMaybe<TransactionReceiptStatus>;
  /** status_data field predicates */
  statusData?: InputMaybe<Scalars['String']>;
  statusDataContains?: InputMaybe<Scalars['String']>;
  statusDataContainsFold?: InputMaybe<Scalars['String']>;
  statusDataEqualFold?: InputMaybe<Scalars['String']>;
  statusDataGT?: InputMaybe<Scalars['String']>;
  statusDataGTE?: InputMaybe<Scalars['String']>;
  statusDataHasPrefix?: InputMaybe<Scalars['String']>;
  statusDataHasSuffix?: InputMaybe<Scalars['String']>;
  statusDataIn?: InputMaybe<Array<Scalars['String']>>;
  statusDataLT?: InputMaybe<Scalars['String']>;
  statusDataLTE?: InputMaybe<Scalars['String']>;
  statusDataNEQ?: InputMaybe<Scalars['String']>;
  statusDataNotIn?: InputMaybe<Array<Scalars['String']>>;
  statusIn?: InputMaybe<Array<TransactionReceiptStatus>>;
  statusNEQ?: InputMaybe<TransactionReceiptStatus>;
  statusNotIn?: InputMaybe<Array<TransactionReceiptStatus>>;
  /** transaction_hash field predicates */
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHashContains?: InputMaybe<Scalars['String']>;
  transactionHashContainsFold?: InputMaybe<Scalars['String']>;
  transactionHashEqualFold?: InputMaybe<Scalars['String']>;
  transactionHashGT?: InputMaybe<Scalars['String']>;
  transactionHashGTE?: InputMaybe<Scalars['String']>;
  transactionHashHasPrefix?: InputMaybe<Scalars['String']>;
  transactionHashHasSuffix?: InputMaybe<Scalars['String']>;
  transactionHashIn?: InputMaybe<Array<Scalars['String']>>;
  transactionHashLT?: InputMaybe<Scalars['String']>;
  transactionHashLTE?: InputMaybe<Scalars['String']>;
  transactionHashNEQ?: InputMaybe<Scalars['String']>;
  transactionHashNotIn?: InputMaybe<Array<Scalars['String']>>;
};

/**
 * TransactionWhereInput is used for filtering Transaction objects.
 * Input was generated by ent.
 */
export type TransactionWhereInput = {
  and?: InputMaybe<Array<TransactionWhereInput>>;
  /** block_id field predicates */
  blockID?: InputMaybe<Scalars['ID']>;
  blockIDContains?: InputMaybe<Scalars['ID']>;
  blockIDContainsFold?: InputMaybe<Scalars['ID']>;
  blockIDEqualFold?: InputMaybe<Scalars['ID']>;
  blockIDGT?: InputMaybe<Scalars['ID']>;
  blockIDGTE?: InputMaybe<Scalars['ID']>;
  blockIDHasPrefix?: InputMaybe<Scalars['ID']>;
  blockIDHasSuffix?: InputMaybe<Scalars['ID']>;
  blockIDIn?: InputMaybe<Array<Scalars['ID']>>;
  blockIDIsNil?: InputMaybe<Scalars['Boolean']>;
  blockIDLT?: InputMaybe<Scalars['ID']>;
  blockIDLTE?: InputMaybe<Scalars['ID']>;
  blockIDNEQ?: InputMaybe<Scalars['ID']>;
  blockIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  blockIDNotNil?: InputMaybe<Scalars['Boolean']>;
  /** contract_id field predicates */
  contractID?: InputMaybe<Scalars['ID']>;
  contractIDContains?: InputMaybe<Scalars['ID']>;
  contractIDContainsFold?: InputMaybe<Scalars['ID']>;
  contractIDEqualFold?: InputMaybe<Scalars['ID']>;
  contractIDGT?: InputMaybe<Scalars['ID']>;
  contractIDGTE?: InputMaybe<Scalars['ID']>;
  contractIDHasPrefix?: InputMaybe<Scalars['ID']>;
  contractIDHasSuffix?: InputMaybe<Scalars['ID']>;
  contractIDIn?: InputMaybe<Array<Scalars['ID']>>;
  contractIDLT?: InputMaybe<Scalars['ID']>;
  contractIDLTE?: InputMaybe<Scalars['ID']>;
  contractIDNEQ?: InputMaybe<Scalars['ID']>;
  contractIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** entry_point_selector field predicates */
  entryPointSelector?: InputMaybe<Scalars['String']>;
  entryPointSelectorContains?: InputMaybe<Scalars['String']>;
  entryPointSelectorContainsFold?: InputMaybe<Scalars['String']>;
  entryPointSelectorEqualFold?: InputMaybe<Scalars['String']>;
  entryPointSelectorGT?: InputMaybe<Scalars['String']>;
  entryPointSelectorGTE?: InputMaybe<Scalars['String']>;
  entryPointSelectorHasPrefix?: InputMaybe<Scalars['String']>;
  entryPointSelectorHasSuffix?: InputMaybe<Scalars['String']>;
  entryPointSelectorIn?: InputMaybe<Array<Scalars['String']>>;
  entryPointSelectorIsNil?: InputMaybe<Scalars['Boolean']>;
  entryPointSelectorLT?: InputMaybe<Scalars['String']>;
  entryPointSelectorLTE?: InputMaybe<Scalars['String']>;
  entryPointSelectorNEQ?: InputMaybe<Scalars['String']>;
  entryPointSelectorNotIn?: InputMaybe<Array<Scalars['String']>>;
  entryPointSelectorNotNil?: InputMaybe<Scalars['Boolean']>;
  /** executor_id field predicates */
  executorID?: InputMaybe<Scalars['ID']>;
  executorIDContains?: InputMaybe<Scalars['ID']>;
  executorIDContainsFold?: InputMaybe<Scalars['ID']>;
  executorIDEqualFold?: InputMaybe<Scalars['ID']>;
  executorIDGT?: InputMaybe<Scalars['ID']>;
  executorIDGTE?: InputMaybe<Scalars['ID']>;
  executorIDHasPrefix?: InputMaybe<Scalars['ID']>;
  executorIDHasSuffix?: InputMaybe<Scalars['ID']>;
  executorIDIn?: InputMaybe<Array<Scalars['ID']>>;
  executorIDIsNil?: InputMaybe<Scalars['Boolean']>;
  executorIDLT?: InputMaybe<Scalars['ID']>;
  executorIDLTE?: InputMaybe<Scalars['ID']>;
  executorIDNEQ?: InputMaybe<Scalars['ID']>;
  executorIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  executorIDNotNil?: InputMaybe<Scalars['Boolean']>;
  /** block edge predicates */
  hasBlock?: InputMaybe<Scalars['Boolean']>;
  hasBlockWith?: InputMaybe<Array<BlockWhereInput>>;
  hasCalldataValue?: InputMaybe<Scalars['String']>;
  hasCalldataValueAt?: InputMaybe<HasValueInput>;
  /** contract edge predicates */
  hasContract?: InputMaybe<Scalars['Boolean']>;
  hasContractWith?: InputMaybe<Array<ContractWhereInput>>;
  /** deployed_contract edge predicates */
  hasDeployedContract?: InputMaybe<Scalars['Boolean']>;
  hasDeployedContractWith?: InputMaybe<Array<ContractWhereInput>>;
  /** events edge predicates */
  hasEvents?: InputMaybe<Scalars['Boolean']>;
  hasEventsWith?: InputMaybe<Array<EventWhereInput>>;
  /** quest_claims edge predicates */
  hasQuestClaims?: InputMaybe<Scalars['Boolean']>;
  hasQuestClaimsWith?: InputMaybe<Array<AccountQuestWhereInput>>;
  /** receipt edge predicates */
  hasReceipt?: InputMaybe<Scalars['Boolean']>;
  hasReceiptWith?: InputMaybe<Array<TransactionReceiptWhereInput>>;
  /** starter_pack_claims edge predicates */
  hasStarterPackClaims?: InputMaybe<Scalars['Boolean']>;
  hasStarterPackClaimsWith?: InputMaybe<Array<AccountStarterPackWhereInput>>;
  /** to edge predicates */
  hasTo?: InputMaybe<Scalars['Boolean']>;
  hasToWith?: InputMaybe<Array<ContractWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** nonce field predicates */
  nonce?: InputMaybe<Scalars['String']>;
  nonceContains?: InputMaybe<Scalars['String']>;
  nonceContainsFold?: InputMaybe<Scalars['String']>;
  nonceEqualFold?: InputMaybe<Scalars['String']>;
  nonceGT?: InputMaybe<Scalars['String']>;
  nonceGTE?: InputMaybe<Scalars['String']>;
  nonceHasPrefix?: InputMaybe<Scalars['String']>;
  nonceHasSuffix?: InputMaybe<Scalars['String']>;
  nonceIn?: InputMaybe<Array<Scalars['String']>>;
  nonceIsNil?: InputMaybe<Scalars['Boolean']>;
  nonceLT?: InputMaybe<Scalars['String']>;
  nonceLTE?: InputMaybe<Scalars['String']>;
  nonceNEQ?: InputMaybe<Scalars['String']>;
  nonceNotIn?: InputMaybe<Array<Scalars['String']>>;
  nonceNotNil?: InputMaybe<Scalars['Boolean']>;
  not?: InputMaybe<TransactionWhereInput>;
  or?: InputMaybe<Array<TransactionWhereInput>>;
  /** transaction_hash field predicates */
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHashContains?: InputMaybe<Scalars['String']>;
  transactionHashContainsFold?: InputMaybe<Scalars['String']>;
  transactionHashEqualFold?: InputMaybe<Scalars['String']>;
  transactionHashGT?: InputMaybe<Scalars['String']>;
  transactionHashGTE?: InputMaybe<Scalars['String']>;
  transactionHashHasPrefix?: InputMaybe<Scalars['String']>;
  transactionHashHasSuffix?: InputMaybe<Scalars['String']>;
  transactionHashIn?: InputMaybe<Array<Scalars['String']>>;
  transactionHashLT?: InputMaybe<Scalars['String']>;
  transactionHashLTE?: InputMaybe<Scalars['String']>;
  transactionHashNEQ?: InputMaybe<Scalars['String']>;
  transactionHashNotIn?: InputMaybe<Array<Scalars['String']>>;
};

export type TwitterQuest = Node & {
  __typename?: 'TwitterQuest';
  id: Scalars['ID'];
  quest: Quest;
  questID: Scalars['ID'];
  targetID: Scalars['String'];
  twitterEvent: TwitterQuestTwitterEvent;
};

/** A connection to a list of items. */
export type TwitterQuestConnection = {
  __typename?: 'TwitterQuestConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TwitterQuestEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type TwitterQuestEdge = {
  __typename?: 'TwitterQuestEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor'];
  /** The item at the end of the edge. */
  node?: Maybe<TwitterQuest>;
};

/** TwitterQuestTwitterEvent is enum for the field twitter_event */
export enum TwitterQuestTwitterEvent {
  Follow = 'FOLLOW',
  Like = 'LIKE',
  Retweet = 'RETWEET'
}

/**
 * TwitterQuestWhereInput is used for filtering TwitterQuest objects.
 * Input was generated by ent.
 */
export type TwitterQuestWhereInput = {
  and?: InputMaybe<Array<TwitterQuestWhereInput>>;
  /** quest edge predicates */
  hasQuest?: InputMaybe<Scalars['Boolean']>;
  hasQuestWith?: InputMaybe<Array<QuestWhereInput>>;
  /** id field predicates */
  id?: InputMaybe<Scalars['ID']>;
  idGT?: InputMaybe<Scalars['ID']>;
  idGTE?: InputMaybe<Scalars['ID']>;
  idIn?: InputMaybe<Array<Scalars['ID']>>;
  idLT?: InputMaybe<Scalars['ID']>;
  idLTE?: InputMaybe<Scalars['ID']>;
  idNEQ?: InputMaybe<Scalars['ID']>;
  idNotIn?: InputMaybe<Array<Scalars['ID']>>;
  not?: InputMaybe<TwitterQuestWhereInput>;
  or?: InputMaybe<Array<TwitterQuestWhereInput>>;
  /** quest_id field predicates */
  questID?: InputMaybe<Scalars['ID']>;
  questIDContains?: InputMaybe<Scalars['ID']>;
  questIDContainsFold?: InputMaybe<Scalars['ID']>;
  questIDEqualFold?: InputMaybe<Scalars['ID']>;
  questIDGT?: InputMaybe<Scalars['ID']>;
  questIDGTE?: InputMaybe<Scalars['ID']>;
  questIDHasPrefix?: InputMaybe<Scalars['ID']>;
  questIDHasSuffix?: InputMaybe<Scalars['ID']>;
  questIDIn?: InputMaybe<Array<Scalars['ID']>>;
  questIDLT?: InputMaybe<Scalars['ID']>;
  questIDLTE?: InputMaybe<Scalars['ID']>;
  questIDNEQ?: InputMaybe<Scalars['ID']>;
  questIDNotIn?: InputMaybe<Array<Scalars['ID']>>;
  /** target_id field predicates */
  targetID?: InputMaybe<Scalars['String']>;
  targetIDContains?: InputMaybe<Scalars['String']>;
  targetIDContainsFold?: InputMaybe<Scalars['String']>;
  targetIDEqualFold?: InputMaybe<Scalars['String']>;
  targetIDGT?: InputMaybe<Scalars['String']>;
  targetIDGTE?: InputMaybe<Scalars['String']>;
  targetIDHasPrefix?: InputMaybe<Scalars['String']>;
  targetIDHasSuffix?: InputMaybe<Scalars['String']>;
  targetIDIn?: InputMaybe<Array<Scalars['String']>>;
  targetIDLT?: InputMaybe<Scalars['String']>;
  targetIDLTE?: InputMaybe<Scalars['String']>;
  targetIDNEQ?: InputMaybe<Scalars['String']>;
  targetIDNotIn?: InputMaybe<Array<Scalars['String']>>;
  /** twitter_event field predicates */
  twitterEvent?: InputMaybe<TwitterQuestTwitterEvent>;
  twitterEventIn?: InputMaybe<Array<TwitterQuestTwitterEvent>>;
  twitterEventNEQ?: InputMaybe<TwitterQuestTwitterEvent>;
  twitterEventNotIn?: InputMaybe<Array<TwitterQuestTwitterEvent>>;
};

/** The `UploadFile` type, represents the request for uploading a file with a certain payload. */
export type UploadFile = {
  alt?: InputMaybe<Scalars['String']>;
  file: Scalars['Upload'];
  id: Scalars['Int'];
};

export type AccountQueryVariables = Exact<{
  address: Scalars['String'];
}>;


export type AccountQuery = { __typename?: 'Query', accounts?: { __typename?: 'AccountConnection', edges?: Array<{ __typename?: 'AccountEdge', node?: { __typename?: 'Account', id: string, credential: { __typename?: 'Credential', id: string, publicKey: string } } | null } | null> | null } | null };


export const AccountDocument = `
    query Account($address: String!) {
  accounts(where: {contractAddress: $address}) {
    edges {
      node {
        id
        credential {
          id
          publicKey
        }
      }
    }
  }
}
    `;
export const useAccountQuery = <
      TData = AccountQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: AccountQueryVariables,
      options?: UseQueryOptions<AccountQuery, TError, TData>
    ) =>
    useQuery<AccountQuery, TError, TData>(
      ['Account', variables],
      fetcher<AccountQuery, AccountQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, AccountDocument, variables),
      options
    );

useAccountQuery.getKey = (variables: AccountQueryVariables) => ['Account', variables];
;
