const fetchOrderBooks = require('./fetchOrderBooks.js');
const getFulfillableOrders = require('./getFulfillableOrders.js');
const getProfitableOrders = require('./getProfitableOrders.js');
const calcEarningsFromOrders = require('./calcEarningsFromOrders.js');

const ExchangeIds = [ 'liqui', 'huobipro' ];
const TradeSymbols = [
  'AST/BTC',
  'BAT/BTC',
  'BAT/ETH',
  'BCH/BTC',
  'BCH/USDT',
  'BTC/USDT',
  'CVC/BTC',
  'CVC/ETH',
  'CVC/USDT',
  'DASH/BTC',
  'DASH/USDT',
  'DGD/BTC',
  'DGD/ETH',
  'EOS/BTC',
  'EOS/ETH',
  'EOS/USDT',
  'ETH/BTC',
  'ETH/USDT',
  'GNT/BTC',
  'GNT/ETH',
  'GNT/USDT',
  'KNC/BTC',
  'LTC/BTC',
  'LTC/USDT',
  'MANA/BTC',
  'MANA/ETH',
  'MCO/BTC',
  'MCO/ETH',
  'OMG/BTC',
  'OMG/ETH',
  'OMG/USDT',
  'PAY/BTC',
  'PAY/ETH',
  'QTUM/BTC',
  'QTUM/ETH',
  'QTUM/USDT',
  'REQ/BTC',
  'REQ/ETH',
  'SALT/BTC',
  'SALT/ETH',
  'SNT/BTC',
  'SNT/USDT',
  'STORJ/BTC',
  'STORJ/USDT',
  'TNT/BTC',
  'TNT/ETH',
  'VEN/BTC',
  'VEN/ETH',
  'ZRX/BTC',
];

const MarketHoldings = {
  // [ amount of BAT, amount of ETH ]
  liqui: [ 100000, 10000 ],
  huobipro: [ 100000, 10000 ],
};

(async function main() {
  for (const symbol of TradeSymbols) {
    /* Fetch the order books for the symbol from each exchange */
    /* Adjust each order book to accomodate for market fees */
    const orderBooks = await fetchOrderBooks(ExchangeIds, symbol);

    /* Based on our holdings in the marketplace, take the fulfillable orders from each market's book */
    /* Merge the order books into one sorted order book */
    const fulfillableOrderBook = getFulfillableOrders(orderBooks, MarketHoldings);

    /* Pull out the profitable order pairs */
    const profitableOrders = getProfitableOrders(fulfillableOrderBook);

    /* Calculate the profit that will be made and the percent margin on stake */
    if (profitableOrders.asks.length > 0) {
      const earnings = calcEarningsFromOrders(profitableOrders);
      console.log('Earnings', symbol, earnings);
    }
  }
})();

process.on('unhandledRejection', r => console.log(r));
