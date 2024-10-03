import { writable } from 'svelte/store';
import type { AccountInterface } from 'starknet';

export const account = writable<AccountInterface | undefined>(undefined);
export const username = writable<string | undefined>(undefined);
