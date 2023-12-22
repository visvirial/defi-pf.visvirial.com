<template>
	<v-table>
		<thead>
			<tr>
				<th v-if="printDescription">Description</th>
				<th class="text-right">Amount</th>
				<th class="text-right">USD Value</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="revenue in value">
				<td v-if="printDescription">{{ revenue.description }}</td>
				<td class="text-right"><AmountCrypto :value="revenue.amount" :symbol="revenue.symbol" /></td>
				<td class="text-right"><AmountUSD :value="revenue.usdValue" /></td>
			</tr>
			<tr>
				<th :colspan="printDescription ? 2 : 1">Total</th>
				<td class="text-right"><AmountUSD :value="totalUSDValue" /></td>
			</tr>
		</tbody>
	</v-table>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		// protocolResults.
		value: Array<Revenue>,
		printDescription: {
			type: Boolean,
			default: true,
		},
	},
	computed: {
		totalUSDValue() {
			return this.value.reduce((acc, revenue) => acc + revenue.usdValue, 0);
		},
	},
});

</script>
