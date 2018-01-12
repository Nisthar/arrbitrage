function getTradesFromOrders(orderBook) {
  const trades = [];
  
  return {
    buy: determineTrades(orderBook.asks),
    sell: determineTrades(orderBook.bids),
  };
}

function determineTrades(orders) {
  const map = orders.reduce((result, order) => {
    if (!result[order.exchangeId]) {
      result[order.exchangeId] = { price: 0, amount: 0 };
    }

    const trade = result[order.exchangeId];
    trade.price = Math.max(trade.price, order.price);
    trade.amount += order.amount;
    return result;
  }, {});

  return Object.keys(map).map(exchangeId => Object.assign({ exchangeId }, map[exchangeId] ));
}

module.exports = getTradesFromOrders;
