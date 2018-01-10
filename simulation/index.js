const fetchOrderBooks = require('./fetchOrderBooks.js');
const getFulfillableOrders = require('./getFulfillableOrders.js');
const getProfitableOrders = require('./getProfitableOrders.js');
const calculateNetResultFromTrades = require('./calculateNetResultFromTrades.js');

const ExchangeIds = [ 'liqui', 'huobipro' ];
const TradeSymbol = 'BAT/ETH';

const MarketHoldings = {
  // [ amount of BAT, amount of ETH ]
  liqui: [ 25, 2500 ],
  huobipro: [ 25, 2500 ],
};

(async function main() {
  /* Fetch the order books for the symbol from each exchange */
  /* Adjust each order book to accomodate for market fees */
  const orderBooks = await fetchOrderBooks(ExchangeIds, TradeSymbol);

  /* Based on our holdings in the marketplace, take the fulfillable orders from each market's book */
  /* Merge the order books into one sorted order book */
  const fulfillableOrderBook = getFulfillableOrders(orderBooks, MarketHoldings);

  /* Pull out the profitable order pairs */
  const profitableOrders = getProfitableOrders(fulfillableOrderBook);

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
        [
          14365, (price)
          128.1388 (amount)
        ],
        ...
      ],
    },
    ...
  ]
  */

  /* Calculate the profit that will be made and the percent margin on stake */
  const earnings = calculateNetResultFromTrades(trades, MarketHoldings);
  console.log('Earnings', earnings);
})();
