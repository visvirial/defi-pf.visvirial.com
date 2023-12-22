<template>
	<Amount :value="value" /> {{ symbol }}
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		value: Number,
		symbol: String,
	},
});

</script>
