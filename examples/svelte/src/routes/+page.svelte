<script lang="ts">
	import { onMount } from 'svelte';
	import Controller from '@cartridge/controller';
	import { account, username } from '../stores/account';
	import UserInfo from '../components/UserInfo.svelte';
	import TransferEth from '../components/TransferEth.svelte';
	import { ETH_CONTRACT } from '../constants';

	let controller = new Controller({
		policies: [
			{
				target: ETH_CONTRACT,
				method: 'approve',
				description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
			},
			{
				target: ETH_CONTRACT,
				method: 'transfer'
			},
			{
				target: ETH_CONTRACT,
				method: 'mint'
			},
			{
				target: ETH_CONTRACT,
				method: 'burn'
			},
			{
				target: ETH_CONTRACT,
				method: 'allowance'
			}
		],
		rpc: 'https://api.cartridge.gg/x/starknet/sepolia' // sepolia, mainnet, or slot
	});

	let loading: boolean = true;

	async function connect() {
		try {
			const res = await controller.connect();
			if (res) {
				account.set(controller);
				username.set(await controller.username());
			}
		} catch (e) {
			console.log(e);
		}
	}

	function disconnect() {
		controller.disconnect();
		account.set(undefined);
		username.set(undefined);
	}

	onMount(async () => {
		if (await controller.probe()) {
			// auto connect
			await connect();
		}
		loading = false;
	});
</script>

<h1>SvelteKit + Controller Example</h1>

<div>
	{#if loading}
		<p>Loading</p>
	{:else if $account}
		<button on:click={disconnect}>Disconnect</button>
	{:else}
		<button on:click={connect}>Connect</button>
	{/if}
</div>

{#if $account && !loading}
	<UserInfo accountAddress={$account?.address} username={$username} />
	<TransferEth account={$account} />
{/if}
