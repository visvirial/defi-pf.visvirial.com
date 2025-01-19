<template>
	<v-main>
		<v-container>
			
			<h1>DeFi Portfolio</h1>
			
			<div class="text-center">
				<p>Updated on: {{ lastUpdate < 0 ? 'loading...' : new Date(lastUpdate).toLocaleString() }}</p>
			</div>
			
			<v-card>
				<v-tabs v-model="tab">
					<v-tab value="balance-sheet">Balance Sheet</v-tab>
					<v-tab value="daily-revenue">Daily Revenue</v-tab>
					<v-tab value="vaults">Vaults Breakdown</v-tab>
					<v-tab value="config">Wallet Config</v-tab>
				</v-tabs>
				<v-card-text>
					<v-window v-model="tab">
						<!-- Balance Sheet -->
						<v-window-item value="balance-sheet">
							<v-card>
								<v-tabs v-model="tabBalanceSheet">
									<template v-for="(balanceSheet, walletName) in balanceSheets">
										<v-tab :value="'balance-sheet-' + walletName">{{ walletName }}</v-tab>
									</template>
								</v-tabs>
								<v-card-text>
									<v-window v-model="tabBalanceSheet">
										<template v-for="(balanceSheet, walletName) in balanceSheets">
											<v-window-item :value="'balance-sheet-' + walletName">
												<BalanceSheet :value="balanceSheet" />
											</v-window-item>
										</template>
									</v-window>
								</v-card-text>
							</v-card>
						</v-window-item>
						<!-- Daily Revenue -->
						<v-window-item value="daily-revenue">
							<v-card>
								<v-tabs v-model="tabDailyRevenue">
									<template v-for="(dailyRevenue, walletName) in dailyRevenues">
										<v-tab :value="'daily-revenue-' + walletName">{{ walletName }}</v-tab>
									</template>
								</v-tabs>
								<v-card-text>
									<v-window v-model="tabDailyRevenue">
										<template v-for="(dailyRevenue, walletName) in dailyRevenues">
											<v-window-item :value="'daily-revenue-' + walletName">
												<DailyRevenue :value="dailyRevenue" />
											</v-window-item>
										</template>
									</v-window>
								</v-card-text>
							</v-card>
						</v-window-item>
						<!-- Vaults Breakdown -->
						<v-window-item value="vaults">
							<div v-for="(protocolResults, walletName) in wallets">
								<h2 >{{ walletName }}</h2>
								<div v-for="protocolResult in protocolResults">
									<h3>{{ protocolResult.name }} ({{ protocolResult.chain }})</h3>
									<div v-for="vault in protocolResult.vaults">
										<div>
											<h4>Exposures</h4>
											<v-table>
												<tbody>
													<tr v-for="(amount, symbol) in vault.exposures">
														<td class="text-right"><Amount :value="amount" /></td>
														<td class="text-left" style="width:8em"><Symbol :value="symbol" /></td>
													</tr>
												</tbody>
											</v-table>
										</div>
										<div v-if="vault.annualRevenues.length">
											<h4>Daily Revenues</h4>
											<v-table>
												<tbody>
													<tr v-for="revenue in vault.annualRevenues">
														<td class="text-right"><Amount :value="revenue.amount / 365" /></td>
														<td class="text-left" style="width:8em"><Symbol :value="revenue.symbol" /></td>
													</tr>
												</tbody>
											</v-table>
										</div>
									</div>
								</div>
							</div>
						</v-window-item>
						<v-window-item value="config">
							<v-text-field label="E-Mail" v-model="email"></v-text-field>
							<v-text-field
				 				:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
								:type="showPassword ? 'text' : 'password'"
								label="Password"
								v-model="password"
								@click:append="showPassword = !showPassword"
							></v-text-field>
							<v-btn @click="updateWalletYAML">Apply &amp; Save</v-btn>
							<hr style="margin: 30px 0px;" />
							<v-textarea auto-grow readonly v-model="walletsYAML"></v-textarea>
						</v-window-item>
					</v-window>
				</v-card-text>
			</v-card>
			
			<footer style="margin-top: 30px;">
				Copyright &copy; @visvirial all rights reserved.
			</footer>
			
		</v-container>
	</v-main>
</template>

<style lang="css">
	h1 {
		border-left: 10px solid gray;
		border-bottom: 1px solid gray;
		padding-left: 10px;
		margin-bottom: 30px;
	}
	h2 {
		border-left: 5px solid gray;
		border-bottom: 1px solid gray;
		padding-left: 10px;
		margin-top: 30px;
		margin-bottom: 30px;
	}
	h3 {
		border-left: 2px solid gray;
		border-bottom: 1px solid gray;
		padding-left: 10px;
		margin-top: 30px;
		margin-bottom: 30px;
	}
	h4 {
		border-bottom: 1px solid gray;
		margin-top: 30px;
		margin-bottom: 30px;
	}
</style>

<script lang="ts">

import { parse } from 'yaml';
import { defineComponent } from 'vue';

import { BalanceSheet } from '@/components/BalanceSheet';
import { DailyRevenue } from '@/components/DailyRevenue';

export default defineComponent({
	name: 'App',
	data() {
		return {
			tab: null,
			tabBalanceSheet: 'balance-sheet-Total',
			tabDailyRevenue: 'daily-revenue-Total',
			email: localStorage.getItem('email') || '',
			password: localStorage.getItem('password') || '',
			walletsYAML: '',
			// wallets[walletName] = ProtcolResult[].
			wallets: {} as any,
			balanceSheets: {} as { [walletName: string]: BalanceSheet },
			dailyRevenues: {} as { [walletName: string]: DailyRevenue },
			lastUpdate: -1,
		};
	},
	mounted() {
		this.updateWalletYAML(true);
	},
	methods: {
		async updateWalletYAML(omitAltert = false) {
			// Fetch WalletsYAML.
			const params = new URLSearchParams({ email: this.email, password: this.password });
			try {
				this.walletsYAML = await (await fetch('https://wallets-defi-pf.visvirial.com/get?' + params.toString())).text();
			} catch(e) {
				if(!omitAltert) {
					alert('Failed to fetch Wallets YAML! Check your email and password.');
				}
			}
			// Save email and password.
			localStorage.setItem('email', this.email);
			localStorage.setItem('password', this.password);
			this.refresh();
		},
		async updateBalanceSheets() {
			// Clear data.
			this.balanceSheets = {};
			// Compute for each wallets.
			for(const walletName in this.wallets) {
				this.balanceSheets[walletName] = new BalanceSheet(this.wallets[walletName]);
				await this.balanceSheets[walletName].init();
			}
		},
		async updateDailyRevenues() {
			// Clear data.
			this.dailyRevenues = {};
			// Compute for each wallets.
			for(const walletName in this.wallets) {
				this.dailyRevenues[walletName] = new DailyRevenue(this.wallets[walletName]);
				await this.dailyRevenues[walletName].init();
			}
		},
		async refresh() {
			this.lastUpdate = -1;
			this.wallets = {};
			// Fetch data from API.
			const wallets = {};
			const walletsJSON = parse(this.walletsYAML);
			for(const walletName of Object.keys(walletsJSON)) {
				const wallet = walletsJSON[walletName];
				const query = new URLSearchParams({ wallet: JSON.stringify(wallet) });
				const res = await fetch('https://api.defi-pf.visvirial.com/?' + query.toString());
				const json = await res.json();
				wallets[walletName] = json.data;
			}
			// Add total.
			const allProtocolResults = [].concat(...Object.values(wallets));
			this.wallets['Total'] = allProtocolResults;
			for(const walletName in wallets) {
				this.wallets[walletName] = wallets[walletName];
			}
			await this.updateBalanceSheets();
			await this.updateDailyRevenues();
			this.lastUpdate = Date.now();
		},
	},
});

</script>

