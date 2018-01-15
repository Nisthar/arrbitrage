function getTradesFromOrders(orderBook) {
  const trades = [];
  
  return {
    buy: buildTradesFromOrderBook('buy', orderBook.asks),
    sell: buildTradesFromOrderBook('sell', orderBook.bids),
  };
}

function buildTradesFromOrderBook(orderType, orders) {
  const map = orders.reduce((result, order) => {
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
    return result;
  }, {});

  return Object.keys(map).map(exchangeId => Object.assign({ exchangeId }, map[exchangeId] ));
}

module.exports = getTradesFromOrders;
