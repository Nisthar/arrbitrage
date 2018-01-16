const { expect } = require('chai');
const getTradesFromOrders = require('./getTradesFromOrders');
const genOrder = (exchangeId, price, amount) => ({ exchangeId, amount, price });
const emptyTrade = { buy: [], sell: [], all: [] };

describe('Get trades from orders', () => {
  it('Empty order book yields no trades', () => {
    const orderBook = { asks: [], bids: [] };
    const result = getTradesFromOrders(orderBook);
    expect(result).to.deep.eq(emptyTrade);
  });

  it('Basic conversion of single ask and bid pair', () => {
    const orderBook = {
      asks: [ genOrder('a', 4.5, 3.9), genOrder('c', 2.9, 1) ],
      bids: [ genOrder('b', 4.5, 3.9) ],
    };
    const result = getTradesFromOrders(orderBook);
    expect(result.sell).to.deep.eq([ { exchangeId: 'b', price: 4.5, amount: 3.9, orderType: 'sell', isValid: true } ]);
    expect(result.buy).to.deep.eq([
        { exchangeId: 'a', price: 4.5, amount: 3.9, orderType: 'buy', isValid: true },
        { exchangeId: 'c', price: 2.9, amount: 1, orderType: 'buy', isValid: true }
      ]);
  });

  it('Trade below min limit', () => {
    const orderBook = {
      asks: [ genOrder('a', 4.5, 3.9), genOrder('c', 2.9, 1) ],
      bids: [ genOrder('b', 4.5, 3.9) ],
    };
    const limits = { a: { amount: { min: 2} }, c: { amount: { min: 2 } } };
    const result = getTradesFromOrders(orderBook, limits);
    expect(result.sell[0]).to.deep.include({ isValid: true });
    expect(result.buy[0]).to.deep.include({ isValid: true });
    expect(result.buy[1]).to.eq(undefined);
  });
});
