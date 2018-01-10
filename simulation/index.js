const loadMarketsForExchange = require('./loadMarketsForExchange.js');
const calculateNetResultFromTrades = require('./calculateNetResultFromTrades.js');

const ExchangeIds = [ 'liqui', 'huobipro' ];
const TradeSymbol = 'BAT/ETH';

const MarketHoldings = {
  liqui: {
    ETH: 25,
    BAT: 2500,
  },
  huobipro: {
    ETH: 25,
    BAT: 2500,
  },
};

const markets = loadMarketsForExchange(ExchangeIds);

/* Get the order book for the markets */
const orderBooks = getOrderBooks(markets, TradeSymbol);

/* Adjust each order book to accomodate for market fees */
addPricesAfterFeesToOrderBooks(orderBooks, ExchangeIds);

/* Based on our holdings in the marketplace, take the fulfillable orders from each market's book */
/* Merge the order books into one sorted order book */
const mergedFulfillableOrderBook = getFulfillableOrdersBasedOnHoldings(orderBooks, MarketHoldings);

/* Pull out the profitable order pairs */
const profitableOrders = getProfitableOrders(mergedFulfillableOrderBook);

/* Convert the overlapping orders into trades for each marketplace */
const trades = convertOrdersToTrades(profitableOrders);

/*
const trades = [
  {
    exchange: 'quadriga',
    pair: 'BAT/ETH',
    limitPrice: '0.00064',
    amount: 10,

    expectedOrders: [
      {
        14365,
        128.1388
      },
      ...
    ],
  },
  ...
]
*/

/* Calculate the profit that will be made and the percent margin on stake */
const earnings = calculateNetResultFromTrades(trades, MarketHoldings);
console.log('Earnings', earnings);
