<script>
	import Header from '$lib/header/Header.svelte';
	import Sidebar from '$lib/sidebar/Sidebar.svelte';
	import ThemeContext from '$lib/theme/ThemeContext.svelte';
	import '../app.css';

	const ws = new WebSocket('ws://127.0.0.1:7890/v1');
	ws.onopen = () => {
		console.log('CONNESSO');
	};

	ws.onclose = () => {
		console.log('DISCONNESSO');
	};

	ws.onerror = () => {
		console.log('ERRORINO');
	};

	ws.onmessage = (msg) => {
		let j = JSON.parse(msg.data);
		console.log('MSG', j);
	};

	setTimeout(() => {
		ws.send(
			JSON.stringify({
				type: 4,
				id: 'ciaopippo',
				payload: {
					action: 0
				}
			})
		);
	}, 5000);

	setTimeout(() => {
		ws.send(
			JSON.stringify({
				type: 0,
				id: 'ping-ping',
				payload: {}
			})
		);
	}, 50_000);
</script>

<ThemeContext>
	<div class="container">
		<Sidebar />
		<div class="innerContainer">
			<Header />
			<main>
				<div class="layout" />
				<slot />
			</main>
		</div>
	</div>
</ThemeContext>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		background-image: url('background.png');
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
	}
	.layout {
		width: 100%;
		height: calc(100vh - 32px);
		background: linear-gradient(180deg, rgba(26, 32, 44, 0.85) 0%, #1a202c 53.76%);
		backdrop-filter: blur(20px);
	}

	/* .main::after {
		content: '';
		width: 100%;
		height: calc(100vh - 32px);
		background: linear-gradient(180deg, rgba(26, 32, 44, 0.85) 0%, #1a202c 53.76%);
		backdrop-filter: blur(20px);
	} */

	.container {
		position: relative;
		display: flex;
		height: 100vh;
	}

	.innerContainer {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: calc(100% - 65px);
		box-sizing: border-box;
	}

	@media (min-width: 480px) {
	}
</style>
