<template>
	{{ value.toLocaleString(undefined, { minimumFractionDigits: fraction, maximumFractionDigits: fraction }) }}
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		value: Number,
		fraction: {
			type: Number,
			default: 4,
		},
	},
});

</script>
