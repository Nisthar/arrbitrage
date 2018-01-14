'use strict';

function getProfitableOrders(orderBook, priceMarginPercent = 0) {
  const { asks, bids } = orderBook;
  const result = {
    asks: [],
    bids: [],
  };

  let askIterator = 0, bidIterator = 0;
  let currentAsk = Object.assign({}, asks[askIterator]), currentBid = Object.assign({}, bids[bidIterator]);
  while (currentAsk && currentBid && currentAsk.priceWithFee * (1 + priceMarginPercent / 100) < currentBid.priceWithFee) {
    const amount = Math.min(currentAsk.amount, currentBid.amount);
    if (amount === currentAsk.amount) {
      result.asks.push(currentAsk);
      currentAsk = Object.assign({}, asks[++askIterator]);
    } else {
      const partialAsk = Object.assign({}, currentAsk, { amount });
      result.asks.push(partialAsk);

      /* currentAsk is a copy, so we adjust it to be the remaining amount */
      currentAsk.amount -= amount;
    }

    if (amount === currentBid.amount) {
      result.bids.push(currentBid);
      currentBid = Object.assign({}, bids[++bidIterator]);
    } else {
      const partialBid = Object.assign({}, currentBid, { amount });
      result.bids.push(partialBid);
      currentBid.amount -= amount;
    }
  }

  return result;
}

module.exports = getProfitableOrders;
