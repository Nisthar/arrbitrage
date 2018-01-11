'use strict';

/* Based on our holdings in the marketplace, take the fulfillable orders from each market's book */
/* Merge the order books into one sorted order book */

function getFulfillableOrders(exchanges, holdings) {
  const ids = Object.keys(exchanges);
  const result = {
    bids: [],
    asks: [],
  };

  for (let id of ids) {
    const exchange = exchanges[id];
    result.bids = result.bids.concat(determineFulfillableOrders(exchange.bids, holdings[id][0], 'bid'));
    result.asks = result.asks.concat(determineFulfillableOrders(exchange.asks, holdings[id][1], 'ask'));
  }

  result.bids.sort((a,b) => a.priceWithFee - b.priceWithFee);
  result.asks.sort((a,b) => b.priceWithFee - a.priceWithFee);

  return result;
}

/* Given an array of bids/asks: [price, amount, priceAfterFees] pairs */
function determineFulfillableOrders(orders, holdings, orderType) {
  const result = [];

  let unfulfilledHoldings = holdings;
  for (let i = 0; i < orders.length && unfulfilledHoldings > 0; ++i) {
    const order = orders[i];
    const { price, amount, priceWithFee } = order;
    const orderValue = orderType === 'bid' ? amount : amount * priceWithFee;

    if (orderValue < unfulfilledHoldings) {
      result.push(order);
      unfulfilledHoldings -= orderValue;
    } else {
      const partialAmount = unfulfilledHoldings / priceWithFee;
      const partialOrder = Object.assign({}, order, { amount: partialAmount });
      result.push(partialOrder);
      unfulfilledHoldings = 0;
    }
  }

  return result;
}

module.exports = getFulfillableOrders;
