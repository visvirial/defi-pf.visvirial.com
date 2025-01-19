<template>
	<v-container>
		<v-row>
			<v-col class="text-center">
				<i>Assets</i>
			</v-col>
			<v-col class="text-center">
				<i>Liabilities and Equity</i>
			</v-col>
		</v-row>
		<template v-for="symbol in value.symbols">
			<v-row>
				<v-col class="text-center"><b>{{ symbol }}</b></v-col>
			</v-row>
			<v-row>
				<v-col>
					<BSPositions
						:positions="value.getAssets(symbol)"
						:symbol="symbol"
						:dummyCount="value.getHeight(symbol) - value.getAssetsCount(symbol)"
					/>
				</v-col>
				<v-col>
					<BSPositions
						:positions="value.getLiabilities(symbol)"
						:symbol="symbol"
						:dummyCount="value.getHeight(symbol) - value.getLiabilitiesCount(symbol) - 1"
						:equity="value.getEquity(symbol)"
					/>
				</v-col>
			</v-row>
		</template>
		<v-row>
			<v-col>
				<BalanceSheetTotal
					:ethExposuer="value.ethExposure"
					:totalStables="value.totalStables"
					:totalCryptos="value.totalCryptos"
				/>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export interface Position {
	protocol: string;
	chain: string;
	amount: number;
	usdValue: number;
}

export class BalanceSheet {
	
	private _prices: { [symbol: string]: number } = {};
	private _positions: { [symbol: string]: Position[] } = {};
	
	constructor(protocolResults: any) {
		// Compute balanceSheet.
		for(const protocolResult of protocolResults) {
			for(const vault of protocolResult.vaults) {
				for(const symbol in vault.exposures) {
					const amount = vault.exposures[symbol];
					this.add(symbol, {
						protocol: protocolResult.name,
						chain: protocolResult.chain,
						amount,
						usdValue: 0,
					});
				}
			}
		}
	}
	
	public async init() {
		await this.updatePrices();
	}
	
	public get positions() {
		return this._positions;
	}
	
	public add(symbol: string, position: Position) {
		if(position.amount === 0) return;
		if(this._positions[symbol] === undefined) {
			this._positions[symbol] = [];
		}
		this._positions[symbol].push(position);
	}
	
	public get symbols(): string[] {
		return Object.keys(this._positions);
	}
	
	public get(symbol: string): Position[] {
		return this._positions[symbol] || [];
	}
	
	public getAssetsCount(symbol: string): number {
		return this.get(symbol).filter(asset => asset.amount > 0).length;
	}
	
	public getAssets(symbol: string): Position[] {
		const result = this.get(symbol).filter(asset => asset.amount > 0);
		return result;
	}
	
	public getLiabilitiesCount(symbol: string): number {
		return this.get(symbol).filter(asset => asset.amount < 0).length;
	}
	
	public getLiabilities(symbol: string): Position[] {
		return this.get(symbol).filter(asset => asset.amount < 0);
	}
	
	public getHeight(symbol: string): number {
		return Math.max(this.getAssetsCount(symbol), this.getLiabilitiesCount(symbol)) + 1;
	}
	
	public getEquity(symbol: string): Position {
		return {
			protocol: '',
			chain: '',
			amount: this.get(symbol).reduce((acc, position) => acc + position.amount, 0),
			usdValue: this.get(symbol).reduce((acc, position) => acc + position.usdValue, 0),
		};
	}
	
	public get assets(): { [symbol: string]: Position[] } {
		const result = {};
		for(const symbol of this.symbols) {
			result[symbol] = this.getAssets(symbol);
		}
		return result;
	}
	
	public get liabilities(): { [symbol: string]: Position[] } {
		const result = {};
		for(const symbol of this.symbols) {
			result[symbol] = this.getLiabilities(symbol);
		}
		return result;
	}
	
	public setPrice(symbol: string, price: number) {
		this._prices[symbol] = price;
		for(const position of this._positions[symbol]) {
			position.usdValue = position.amount * price;
		}
	}
	
	public async updatePrices() {
		const res = await fetch('https://api.defi-pf.visvirial.com/prices?symbols=' + this.symbols.join(','));
		const json = await res.json();
		for(let i=0; i<json.data.length; i++) {
			this.setPrice(this.symbols[i], json.data[i]);
		}
	}
	
	public static isUSDStable(symbol: string): boolean {
		const USD_PEGGED = ['USD', 'USDT', 'USDC', 'BUSD', 'DAI', 'sUSD'];
		return (USD_PEGGED.indexOf(symbol) >= 0);
	}
	
	public get totalStablesAndCryptos(): number {
		let totalStables = 0;
		let totalCryptos = 0;
		for(const symbol in this._positions) {
			const value = this._positions[symbol].reduce((acc, position) => acc + position.usdValue, 0);
			if(BalanceSheet.isUSDStable(symbol)) {
				totalStables += value;
			} else {
				totalCryptos += value;
			}
		}
		return {
			totalStables,
			totalCryptos,
		};
	}
	
	public get totalStables(): number {
		return this.totalStablesAndCryptos.totalStables;
	}
	
	public get totalCryptos(): number {
		return this.totalStablesAndCryptos.totalCryptos;
	}
	
	public get ethExposure(): number {
		const eth = this.get('ETH').reduce((acc, position) => acc + position.amount, 0);
		const stEth = this.get('stETH').reduce((acc, position) => acc + position.amount, 0);
		const wstEth = this.get('wstETH').reduce((acc, position) => acc + position.amount, 0);
		return eth + stEth + (wstEth !== 0 ? (wstEth * (this._prices['wstETH'] / this._prices['ETH'])) : 0);
	}
	
}

export default defineComponent({
	props: {
		// protocolResults.
		value: typeof BalanceSheet,
	},
});

</script>
