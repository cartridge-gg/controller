import { writable } from 'svelte/store';
import type { WalletAccount } from 'starknet';

export const account = writable<WalletAccount | undefined>(undefined);
export const username = writable<string | undefined>(undefined);
