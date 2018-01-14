const { getExperimentConfiguration } = require('./experimentConfigurations.js');
const { fetchOrderBooks } = require('./fetchExchangeData.js');
const getHoldingsOnExchange = require('./getHoldingsOnExchange.js');
const getFulfillableOrders = require('./getFulfillableOrders.js');
const getProfitableOrders = require('./getProfitableOrders.js');
const calcEarningsFromOrders = require('./calcEarningsFromOrders.js');
const cryptoValuation = require('./cryptoValuation.js');
const getTradesFromOrders = require('./getTradesFromOrders.js');

const asTable = require('as-table').configure({ delimiter: '|', print: obj => !Number.isNaN(obj) && obj.toPrecision ? obj.toPrecision(2) : String (obj) });

(async function main() {
  const experimentName = process.argv[2];

  const experimentConfiguration = await getExperimentConfiguration(experimentName);
  for (const symbol of experimentConfiguration.symbols) {
    /* Fetch the order books for the symbol from each exchange */
    /* Adjust each order book to accomodate for market fees */
    const orderBooks = await fetchOrderBooks(experimentConfiguration.exchangeIds, symbol);

    /* Determine our current holdings on the market */
    const holdings = !experimentConfiguration.infiniteHoldings ? await getHoldingsOnExchange(experimentConfiguration.exchangeIds, symbol) : undefined;

    /* Based on our holdings in the marketplace, take the fulfillable orders from each market's book */
    /* Merge the order books into one sorted order book */
    const fulfillableOrderBook = getFulfillableOrders(orderBooks, holdings);

    /* Pull out the profitable order pairs */
    const profitableOrders = getProfitableOrders(fulfillableOrderBook);

    if (profitableOrders.asks && profitableOrders.asks.length > 0) {
      /* Calculate the profit that will be made and the percent margin on stake */
      const earnings = calcEarningsFromOrders(profitableOrders);
      const trades = getTradesFromOrders(profitableOrders);

      saveAndLogArrbitrage(symbol, earnings, holdings, trades, experimentConfiguration);
    }
  }
  
  if (experimentConfiguration.logSummaryTable) {
    console.log(asTable(summaries));
  }
})();

const summaries = [];
function saveAndLogArrbitrage(symbol, earnings, holdings, trades, { logDetailedTrades, logTradeDescriptions }) {
  const buyOn = trades.buy.map(t => t.exchangeId);
  const sellOn = trades.sell.map(t => t.exchangeId);

  const approximateValueOfCurrencyB = cryptoValuation[holdings.currencyB];
  const summary = Object.assign({ symbol }, earnings.summary, {
    buyOn,
    sellOn,
    earnedUsd: approximateValueOfCurrencyB && approximateValueOfCurrencyB * earnings.earnedValueB
  });
  summaries.push(summary);

  if (logDetailedTrades) {
    console.log(`${JSON.stringify({ symbol, trades, earnings }, null, 2)}`);
  }

  if (logTradeDescriptions) {
    console.log(`Earn ~$${summary.earnedUsd.toFixed(2)} USD at ${earnings.margin}%-${earnings.bestMargin} on ${symbol}
Buy ${(earnings.totalVolumeA / 2).toPrecision(2)} ${holdings.currencyA} on ${buyOn}
Sell the same on ${sellOn}`);
  }
}

process.on('unhandledRejection', r => console.log(r));
