<script>
	import { page } from '$app/stores';
	import logo from './svelte-logo.svg';
</script>

<aside>
	<div class="logo">
		<a href="https://kit.svelte.dev">
			<img src={logo} alt="SvelteKit" />
		</a>
	</div>

	<!-- <div class="buttons">
		<div class="button green" />
		<div class="button yellow" />
		<div class="button red" />
	</div> -->
</aside>

<style>
	aside {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background: aliceblue;
		height: 650px;
		width: 65px;
		padding: 0 10px;
		background: #171923;
        height: auto;
	}

	.buttons {
		display: flex;
		gap: 10px;
		justify-content: space-around;
		align-items: center;
	}

	.buttons .button {
		height: 16px;
		width: 16px;
		border-radius: 3px;
	}

	.green {
		background: #48bb78;
	}
	.yellow {
		background: #ecc94b;
	}
	.red {
		background: #c53030;
	}

	.logo {
		/* width: 3em;
		height: 3em; */
	}

	.logo a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.logo img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--accent-color);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--accent-color);
	}
</style>
