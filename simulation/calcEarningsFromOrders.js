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
  
  const totalVolumeInA = allOrders.reduce((prev, curr) => prev += curr.amount, 0);
  const meanOrderPrice = allOrders.reduce((prev, curr) => prev += curr.priceWithFee * curr.amount / totalVolumeInA, 0);
  const totalVolumeInB = meanOrderPrice * totalVolumeInA;
  const earnedValueInB = delta.deltaA * meanOrderPrice + delta.deltaB;
  const marginOfVolumeTraded = (earnedValueInB / totalVolumeInB * 100) || 0;

  return {
    deltaByExchange,
    delta,
    totalVolumeInA,
    totalVolumeInB,
    meanOrderPrice,
    earnedValueInB,
    marginOfVolumeTraded,
  };
}

module.exports = calcEarningsFromOrders;
