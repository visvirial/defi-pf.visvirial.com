<template>
	<div>
		<h2>Total</h2>
		<DailyRevenueTable :value="value.totals" :printDescription="false" />
	</div>
	<div v-for="(protocolRevenues, protocol) in value.revenues">
		<h2>{{ protocol }}</h2>
		<div v-for="(chainRevenues, chain) in protocolRevenues">
			<h3>{{ chain }}</h3>
			<DailyRevenueTable :value="chainRevenues" />
		</div>
	</div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export interface Revenue {
	description: string;
	symbol: string;
	amount: number;
	usdValue: number;
}

export class DailyRevenue {
	
	private _prices: { [symbol: string]: number } = {};
	private _revenues: { [protocol: string]: { [chain: string]: Revenue[] } } = {};
	
	constructor(protocolResults: any) {
		for(const protocolResult of protocolResults) {
			for(const vault of protocolResult.vaults) {
				for(const revenue of vault.annualRevenues) {
					this.add(protocolResult.name, protocolResult.chain, {
						description: revenue.description,
						symbol: revenue.symbol,
						amount: revenue.amount / 365,
						usdValue: 0,
					});
				}
			}
		}
	}
	
	public async init() {
		await this.updatePrices();
	}
	
	public get revenues() {
		return this._revenues;
	}
	
	public add(protocol: string, chain: string, revenue: Revenue) {
		if(revenue.amount === 0) return;
		if(this._revenues[protocol] === undefined) this._revenues[protocol] = {};
		if(this._revenues[protocol][chain] === undefined) this._revenues[protocol][chain] = [];
		this._revenues[protocol][chain].push(revenue);
	}
	
	public get symbols() {
		const symbols = [];
		for(const protocolRevenues of Object.values(this._revenues)) {
			for(const chainRevenues of Object.values(protocolRevenues)) {
				for(const revenue of chainRevenues) {
					if(symbols.indexOf(revenue.symbol) < 0) {
						symbols.push(revenue.symbol);
					}
				}
			}
		}
		return symbols;
	}
	
	public setPrice(symbol: string, price: number) {
		this._prices[symbol] = price;
		for(const protocolRevenues of Object.values(this._revenues)) {
			for(const chainRevenues of Object.values(protocolRevenues)) {
				for(const revenue of chainRevenues) {
					if(revenue.symbol === symbol) {
						revenue.usdValue = revenue.amount * price;
					}
				}
			}
		}
	}
	
	public async updatePrices() {
		const symbols = this.symbols;
		if(symbols.length === 0) return;
		const res = await fetch('https://api.defi-portfolio.visvirial.com/prices?symbols=' + symbols.join(','));
		const json = await res.json();
		for(let i=0; i<json.data.length; i++) {
			this.setPrice(symbols[i], json.data[i]);
		}
	}
	
	public get totals(): Revenue[] {
		const revenues = {};
		for(const protocolRevenues of Object.values(this._revenues)) {
			for(const chainRevenues of Object.values(protocolRevenues)) {
				for(const revenue of chainRevenues) {
					if(revenues[revenue.symbol] === undefined) {
						revenues[revenue.symbol] = {
							symbol: revenue.symbol,
							amount: 0,
							usdValue: 0,
						};
					}
					revenues[revenue.symbol].amount += revenue.amount;
					revenues[revenue.symbol].usdValue += revenue.usdValue;
				}
			}
		}
		return Object.values(revenues);
	}
	
}

export default defineComponent({
	props: {
		// protocolResults.
		value: typeof DailyRevenue,
	},
});

</script>
