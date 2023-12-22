<template>
	<template v-if="icon"><img :src="icon" :alt="value + ' icon'" style="height:2ex;margin-bottom:-0.1ex;padding-right:0.2em;" /></template>{{ value }}
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export const getImageUrl = (path: string) => {
	return new URL(`/assets/img/${path}`, import.meta.url).href;
};

export default defineComponent({
	data() {
		return {
			supportedCoins: {
				BTC: 'bitcoin256.png',
			},
		};
	},
	props: {
		value: String,
	},
	computed: {
		icon() {
			return this.supportedCoins[this.value] ? getImageUrl(`symbols/${this.supportedCoins[this.value]}`) : undefined;
		},
	},
});

</script>
