<script lang="ts">
	export let accountAddress: string | undefined;
	export let username: string | undefined;
</script>

<h2>User Information</h2>

<div>
	{#if accountAddress}
		<p>Account Address: {accountAddress}</p>
	{:else}
		<p>No account connected</p>
	{/if}

	{#if username}
		<p>Username: {username}</p>
	{/if}
</div>
