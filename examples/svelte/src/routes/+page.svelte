<script lang="ts">
	import { onMount } from 'svelte';
	import Controller from '@cartridge/controller';
	import { account, username } from '../stores/account';
	import UserInfo from '../components/UserInfo.svelte';
	import TransferEth from '../components/TransferEth.svelte';
	import { ETH_CONTRACT_ADDRESS, STRK_CONTRACT_ADDRESS } from '../constants';
	import { constants } from 'starknet';

	const policies = {
		contracts: {
			[ETH_CONTRACT_ADDRESS]: {
				methods: [
					{
						name: 'approve',
						entrypoint: 'approve',
						description:
							'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
					},
					{ name: 'transfer', entrypoint: 'transfer' },
					{ name: 'mint', entrypoint: 'mint' },
					{ name: 'burn', entrypoint: 'burn' },
					{ name: 'allowance', entrypoint: 'allowance' }
				]
			},
			[STRK_CONTRACT_ADDRESS]: {
				methods: [
					{
						name: 'approve',
						entrypoint: 'approve',
						description:
							'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
					},
					{ name: 'transfer', entrypoint: 'transfer' },
					{ name: 'mint', entrypoint: 'mint' },
					{ name: 'burn', entrypoint: 'burn' },
					{ name: 'allowance', entrypoint: 'allowance' }
				]
			},
			'0x0305f26ad19e0a10715d9f3137573d3a543de7b707967cd85d11234d6ec0fb7e': {
				methods: [{ name: 'new_game', entrypoint: 'new_game' }]
			}
		},
		messages: []
	};

	let controller = new Controller({
		policies,
		defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
		chains: [
			{
				rpcUrl: 'https://api.cartridge.gg/x/starknet/sepolia'
			},
			{
				rpcUrl: 'https://api.cartridge.gg/x/starknet/mainnet'
			}
		]
	});

	let loading: boolean = true;

	async function connect() {
		try {
			const acc = await controller.connect();
			if (acc) {
				account.set(acc);
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
