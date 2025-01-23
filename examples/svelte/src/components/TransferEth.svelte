<script lang="ts">
	import { AccountInterface } from 'starknet';
	import { ETH_CONTRACT_ADDRESS } from '../constants';
	export let account: AccountInterface | undefined;

	let txnHash: string | undefined;
	let isSubmitted: boolean = false;

	async function execute(amount: string, manual: boolean) {
		if (!account) {
			return;
		}

		txnHash = undefined;
		isSubmitted = true;

		account
			.execute([
				{
					contractAddress: ETH_CONTRACT_ADDRESS,
					entrypoint: manual ? 'increaseAllowance' : 'approve', // increaseAllowance is not part of policies so controller will prompt confirmation
					calldata: [account.address, amount, '0x0']
				},
				{
					contractAddress: ETH_CONTRACT_ADDRESS,
					entrypoint: 'transfer',
					calldata: [account.address, amount, '0x0']
				}
			])
			.then(({ transaction_hash }) => {
				txnHash = transaction_hash;
			})
			.catch((e) => console.error(e))
			.finally(() => {
				isSubmitted = false;
			});
	}
</script>

<h2>Transfer Eth</h2>
<p>Address: {ETH_CONTRACT_ADDRESS}</p>
<div>
	<h4>Session</h4>
	<button on:click={() => execute('0x0', false)} disabled={isSubmitted}>
		Transfer 0 ETH to self</button
	>
	<button on:click={() => execute('0x1C6BF52634000', false)} disabled={isSubmitted}>
		Transfer 0.005 ETH to self</button
	>
	<button on:click={() => execute('1B1AE4D6E2EF500000', false)} disabled={isSubmitted}>
		Transfer 500 ETH to self</button
	>

	<h4>Manual</h4>
	<button on:click={() => execute('0x0', true)} disabled={isSubmitted}>
		Transfer 0 ETH to self</button
	>
	<button on:click={() => execute('0x1C6BF52634000', true)} disabled={isSubmitted}>
		Transfer 0.005 ETH to self</button
	>
	<button on:click={() => execute('1B1AE4D6E2EF500000', true)} disabled={isSubmitted}>
		Transfer 500 ETH to self</button
	>
	{#if txnHash}
		<p>Transaction hash: {txnHash}</p>
	{/if}
</div>
