<header data-tauri-drag-region>
	<div class="buttons">
		<div class="button green" />
		<div class="button yellow" />
		<div class="button red" />
	</div>
</header>

<style>
	header {
		position: relative;
		display: flex;
		justify-content: flex-end;
		background: aliceblue;
		height: 32px;
		padding: 0 10px;
		background: #171923;
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
</style>
