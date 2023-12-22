<template>
	<v-table>
		<thead>
			<tr>
				<th>Protocol</th>
				<th class="text-right">Amount</th>
				<th class="text-right">USD Value</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="position in positions">
				<td>{{ position.protocol }}<template v-if="position.chain"> ({{ position.chain }})</template></td>
				<td class="text-right"><AmountCrypto :value="position.amount" :symbol="symbol" /></td>
				<td class="text-right"><AmountUSD :value="position.usdValue" /></td>
			</tr>
			<tr v-for="i in dummyCount">
				<td></td>
				<td></td>
				<td></td>
			</tr>
			<template v-if="equity">
				<tr>
					<td>Equity</td>
					<td class="text-right"><AmountCrypto :value="equity.amount" :symbol="symbol" /></td>
					<td class="text-right"><AmountUSD :value="equity.usdValue" /></td>
				</tr>
			</template>
		</tbody>
	</v-table>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		positions: Array<Position | undefined>,
		symbol: String,
		equity: Number | undefined,
		dummyCount: Number,
		equity: (typeof Position) | undefined,
	},
});

</script>
