<template>
	<v-table>
		<tbody>
			<tr>
				<th>ETH Exposure</th>
				<td class="text-right"><AmountCrypto :value="ethExposuer" symbol="ETH" /></td>
			</tr>
			<tr>
				<th>Total Stables</th>
				<td class="text-right"><AmountUSD :value="totalStables" /></td>
			</tr>
			<tr>
				<th>Total Cryptos</th>
				<td class="text-right"><AmountUSD :value="totalCryptos" /></td>
			</tr>
			<tr>
				<th>Total in USD</th>
				<td class="text-right"><AmountUSD :value="totalStables + totalCryptos" /></td>
			</tr>
		</tbody>
	</v-table>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		ethExposuer: Number,
		totalStables: Number,
		totalCryptos: Number,
	},
});

</script>
