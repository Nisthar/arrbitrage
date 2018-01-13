function calcEarningsFromOrders(orderBook) {
  const deltaReducer = (orderType) => (prev, curr) => {
    const { exchangeId } = curr;
    const existingDelta = prev[exchangeId] || {};
    
    /* To fulfil a bid (buy order), you sell A. Gaining B */
    /* To fulfil an ask (sell order), you buy A. Losing B */
    const sign = orderType === 'bid' ? -1 : +1;
    
    prev[exchangeId] = {
      deltaA: (existingDelta.deltaA || 0) + (sign * curr.amount),
      deltaB: (existingDelta.deltaB || 0) + (-sign * curr.amount * curr.priceWithFee),
    };
    return prev;
  };
  
  const bidHoldingsDelta = orderBook.bids.reduce(deltaReducer('bid'), {});
  const deltaByExchange = orderBook.asks.reduce(deltaReducer('ask'), bidHoldingsDelta);

  const delta = Object.keys(deltaByExchange).reduce((prev, id) => ({
    deltaA: prev.deltaA += deltaByExchange[id].deltaA,
    deltaB: prev.deltaB += deltaByExchange[id].deltaB,
  }), { deltaA: 0, deltaB: 0 })

  const allOrders = orderBook.bids.concat(orderBook.asks);
  
  const totalVolumeA = allOrders.reduce((prev, curr) => prev += curr.amount, 0);
  const meanOrderPrice = allOrders.reduce((prev, curr) => prev += curr.priceWithFee * curr.amount / totalVolumeA, 0);
  const totalVolumeB = meanOrderPrice * totalVolumeA;
  const earnedValueB = delta.deltaA * meanOrderPrice + delta.deltaB;
  const margin = (earnedValueB / totalVolumeB * 100) || 0;
  const bestMargin = orderBook.bids[0] && orderBook.asks[0] && (orderBook.bids[0].priceWithFee - orderBook.asks[0].priceWithFee) / orderBook.asks[0].priceWithFee * 100 || 0;

  return {
    deltaByExchange,
    deltaA: delta.deltaA,
    deltaB: delta.deltaB,
    earnedValueB,
    totalVolumeA,
    totalVolumeB,
    margin,
    bestMargin,
    meanOrderPrice,
    summary: {
      totalVolumeA,
      meanOrderPrice,
      earnedValueB,
      margin,
      bestMargin,
    },
  };
}

module.exports = calcEarningsFromOrders;
