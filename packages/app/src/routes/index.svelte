<script context="module">
	export const prerender = true;
</script>

<script>
	import { getContext } from 'svelte';
	const { theme, changeTheme, getThemes } = getContext('theme');
	import { Button } from 'ui';

	const themes = getThemes();
	let currentTheme = theme.name;

	console.log('THEME', currentTheme);

	// theme.subscribe((value) => {
	// 	currentTheme = value;
	// });
	// console.log(currentTheme);
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>TEST</h1>
	<!-- <select bind:value={currentTheme}>
		{#each themes as themee}
			<option value={themee}>
				{themee.name}
			</option>
		{/each}
	</select>
	<button
		on:click={() => {
			console.log('TT', currentTheme);
			changeTheme(currentTheme.name);
		}}>{$theme.name}</button
	> -->
	<Button size="large" variant="second" theme="error" onClick={() => console.log('TEST')}>Large</Button>
	<!-- <Button size="medium">Normal</Button> -->
	<!-- <Button size="small">Small</Button> -->
</section>

<style>
	:global(html) {
		background-color: var(--theme-background);
		color: var(--theme-text);
	}
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
		position: absolute;
	}

	.square {
		height: 50px;
		width: 50px;
		background: var(--theme-color);
	}

	h1 {
		color: var(--theme-text);
		width: 100%;
	}

	.welcome {
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
