const { getExperimentConfiguration } = require('./experimentConfigurations');
const { fetchOrderBooks, executeTrades } = require('./fetchExchangeData.js');
const getHoldingsOnExchange = require('./getHoldingsOnExchange');
const getFulfillableOrders = require('./getFulfillableOrders');
const getProfitableOrders = require('./getProfitableOrders');
const calcEarningsFromOrders = require('./calcEarningsFromOrders');
const cryptoValuation = require('./cryptoValuation');
const getTradesFromOrders = require('./getTradesFromOrders');

const asTable = require('as-table').configure({ delimiter: '|', print: obj => !Number.isNaN(obj) && obj.toPrecision ? obj.toPrecision(2) : String (obj) });

(async function main() {
  const experimentName = process.argv[2];

  const experimentConfiguration = await getExperimentConfiguration(experimentName);
  for (const symbol of experimentConfiguration.symbols) {
    /* Fetch the order books for the symbol from each exchange */
    /* Adjust each order book to accomodate for market fees */
    const orderBooks = await fetchOrderBooks(experimentConfiguration.exchangeIds, symbol);

    /* Determine our current holdings on the market */
    const currencies = parseCurrenciesFromSymbol(symbol);
    const holdings = !experimentConfiguration.infiniteHoldings ? await getHoldingsOnExchange(experimentConfiguration.exchangeIds, currencies) : undefined;

    /* Based on our holdings in the marketplace, take the fulfillable orders from each market's book */
    /* Merge the order books into one sorted order book */
    const fulfillableOrderBook = getFulfillableOrders(orderBooks, holdings);

    /* Pull out the profitable order pairs */
    const profitableOrders = getProfitableOrders(fulfillableOrderBook, experimentConfiguration.priceMarginAfterFees || 0);

    if (profitableOrders.asks && profitableOrders.asks.length > 0) {
      /* Calculate the profit that will be made and the percent margin on stake */
      const usdValueForCurrencyB = cryptoValuation[currencies[1]];
      const earnings = calcEarningsFromOrders(profitableOrders, usdValueForCurrencyB);
      const trades = getTradesFromOrders(profitableOrders);
      
      if (!experimentConfiguration.profitThresholdUsd || earnings.earnedUsd >= experimentConfiguration.profitThresholdUsd) {
        saveAndLogArrbitrage(symbol, earnings, holdings, currencies, trades, experimentConfiguration);

        if (experimentConfiguration.autoExecuteTrades) {
          const executedTrades = await executeTrades(trades, symbol);
          console.log(JSON.stringify(executedTrades));
          console.log('');
          process.exit(1);
        }
      }
    }
  }
  
  if (experimentConfiguration.logSummaryTable) {
    console.log(asTable(summaries));
  }
})();

const summaries = [];
function saveAndLogArrbitrage(symbol, earnings, holdings, currencies, trades, { logDetailedTrades, logTradeDescriptions }) {
  const buyOn = trades.buy.map(t => t.exchangeId);
  const sellOn = trades.sell.map(t => t.exchangeId);
  const summary = Object.assign({ symbol }, earnings.summary, { buyOn, sellOn });
  summaries.push(summary);

  if (logDetailedTrades) {
    console.log(`${JSON.stringify({ symbol, trades, earnings }, null, 2)}`);
  }

  if (logTradeDescriptions) {
    console.log(`Earn ~$${earnings.earnedUsd.toFixed(2)} USD at ${earnings.bestMargin.toFixed(1)}% - ${earnings.margin.toFixed(1)}% on ${symbol}
Buy ${(earnings.totalVolumeA / 2).toPrecision(2)} ${currencies[0]} on ${buyOn}
Sell the same on ${sellOn}`);

    console.log(`Details: node simulation deep ${[ ...buyOn, ...sellOn ].join(',')} ${symbol}`);
    console.log('Execute:');
    const commandToExecuteTrade = (orderType, trade) => `node execute ${trade.exchangeId} ${orderType} ${trade.amount} ${symbol} ${trade.price}`;
    trades.buy.map(t => commandToExecuteTrade('buy', t)).forEach(t => console.log(t));
    trades.sell.map(t => commandToExecuteTrade('sell', t)).forEach(t => console.log(t));
    console.log('');
  }
}

function parseCurrenciesFromSymbol(symbol) {
  const slashPosition = symbol.indexOf('/');
  if (slashPosition <= 0) throw `Invalid symbol: ${symbol}`;
  const currencyA = symbol.substring(0, slashPosition);
  const currencyB = symbol.substring(slashPosition + 1, symbol.length);
  return [currencyA, currencyB];
}

process.on('unhandledRejection', r => console.log(r));
