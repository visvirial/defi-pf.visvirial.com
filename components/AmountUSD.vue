<template>
	{{ value < 0 ? '-' : '' }}$<Amount :value="Math.abs(value)" :fraction="2" />
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		value: Number,
	},
});

</script>
