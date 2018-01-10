function getProfitableOrders(orderBook) {
  const { asks, bids } = orderBook;
  const result = [];

  let askIterator = 0, bidIterator = 0;
  while (askIterator < asks.length && asks[askIterator].priceWithFee < bids[bidIterator].priceWithFee) {
    const ask = asks[askIterator];
    const bid = bids[bidIterator];

    askIterator++;
    bidIterator++;
  }

  return result;
}

function convertToFullOrPartialOrder(order, amount) {
  if (order.amount === amount) {
    return order;
  }

  return Object.assign({}, order, { amount });
}

module.exports = getProfitableOrders;
