import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		}),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		ssr: false,
		hydrate: true,
		prerender: {
			enabled: true
		}
	}
};

export default config;
