const getConfiguration = require('./experimentConfigurations.js');
const { fetchOrderBooks } = require('./fetchExchangeData.js');
const getFulfillableOrders = require('./getFulfillableOrders.js');
const getProfitableOrders = require('./getProfitableOrders.js');
const calcEarningsFromOrders = require('./calcEarningsFromOrders.js');

(async function main() {
  const experimentName = process.argv[2];
  console.log(`Running experiment ${experimentName}`);

  const experimentConfiguration = await getConfiguration(experimentName);
  for (const symbol of experimentConfiguration.symbols) {
    /* Fetch the order books for the symbol from each exchange */
    /* Adjust each order book to accomodate for market fees */
    const orderBooks = await fetchOrderBooks(experimentConfiguration.exchangeIds, symbol);

    /* Based on our holdings in the marketplace, take the fulfillable orders from each market's book */
    /* Merge the order books into one sorted order book */
    const fulfillableOrderBook = getFulfillableOrders(orderBooks, experimentConfiguration.holdings);

    /* Pull out the profitable order pairs */
    const profitableOrders = getProfitableOrders(fulfillableOrderBook);

    /* Calculate the profit that will be made and the percent margin on stake */
    if (profitableOrders.asks.length > 0) {
      const buyOn = Array.from(new Set(profitableOrders.asks.map(o => o.exchangeId)));
      const sellOn = Array.from(new Set(profitableOrders.bids.map(o => o.exchangeId)));

      const earnings = calcEarningsFromOrders(profitableOrders);
      if (experimentConfiguration.display === 'detailed') {
        console.log(`${JSON.stringify({ symbol, earnings, profitableOrders}, null, 2)}`);
      } else if (experimentConfiguration.display === 'table') {
        console.log(`${symbol}|${earnings.margin.toFixed(2)}%|${earnings.bestMargin.toFixed(2)}%|${earnings.totalVolumeB}|${buyOn}|${sellOn}`);
      } else {
        console.log(`${JSON.stringify({ symbol, earnings }, null, 2)}`);
      }
    }
  }
})();

process.on('unhandledRejection', r => console.log(r));
