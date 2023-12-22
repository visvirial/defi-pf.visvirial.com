
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	target: 'static',
	//...
	build: {
		transpile: ['vuetify'],
	},
	modules: [
		(_options, nuxt) => {
			nuxt.hooks.hook('vite:extendConfig', (config) => {
				// @ts-expect-error
				config.plugins.push(vuetify({ autoImport: true }))
			})
		},
		//...
	],
	vite: {
		vue: {
			template: {
				transformAssetUrls,
			},
		},
	},
	devtools: { enabled: true }
})
