const isAmountWithinLimits = require('./../lib/is-amount-within-limit');

function getTradesFromOrders(orderBook, limits) {
  const trades = [];
  
  const result = {
    buy: buildTradesFromOrders('buy', orderBook.asks, limits),
    sell: buildTradesFromOrders('sell', orderBook.bids, limits),
  };
  result.all = [ ...result.buy, ...result.sell ];
  return result;
}

function buildTradesFromOrders(orderType, orders, limits) {
  const trades = orders.reduce((result, order) => {
    const { exchangeId } = order;
    if (!result[exchangeId]) {
      const initialPrice = orderType === 'buy' ? 0 : Number.MAX_VALUE;
      result[exchangeId] = { exchangeId, price: initialPrice, amount: 0, orderType };
    }

    const trade = result[exchangeId];
    /*
    Buy at the highest profitable price
    Sell at the lowest profitable price
    */
    trade.price = orderType === 'buy' ? Math.max(trade.price, order.price) : Math.min(trade.price, order.price);
    trade.amount += order.amount;
    trade.isValid = isAmountWithinLimits(limits, exchangeId, trade.amount);

    return result;
  }, {});

  return Object.keys(trades)
    .map(exchangeId => Object.assign({ exchangeId }, trades[exchangeId] ))
    .filter(trade => trade.isValid);
}

module.exports = getTradesFromOrders;
