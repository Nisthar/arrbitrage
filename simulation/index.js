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
  console.log(`Running experiment ${experimentName}`);

  const experimentConfiguration = await getExperimentConfiguration(experimentName);
  const summaries = [];
  for (const symbol of experimentConfiguration.symbols) {
    console.log(`Arrr-bitrations for ${symbol}`);
  
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
      const buyOn = trades.buy.map(t => t.exchangeId);
      const sellOn = trades.sell.map(t => t.exchangeId);

      const approximateValueOfCurrencyB = cryptoValuation[holdings.currencyB];
      summaries.push(Object.assign({ symbol }, earnings.summary, {
        buyOn,
        sellOn,
        earnedUsd: approximateValueOfCurrencyB && approximateValueOfCurrencyB * earnings.earnedValueB
      }));

      if (experimentConfiguration.display !== 'table') {
        console.log(`${JSON.stringify({ symbol, trades, earnings }, null, 2)}`);
      }
    }
  }
  
  if (experimentConfiguration.display === 'table') {
    console.log(asTable(summaries));
  }
})();

process.on('unhandledRejection', r => console.log(r));
