const { expect } = require('chai');
const getTradesFromOrders = require('./getTradesFromOrders');
const genOrder = (exchangeId, price, amount) => ({ exchangeId, amount, price });

describe('Get trades from orders', () => {
  it('Empty order book yields no trades', () => {
    const orderBook = { asks: [], bids: [] };
    const result = getTradesFromOrders(orderBook);
    expect(result).to.deep.eq({ buy: [], sell: [] });
  });

  it('Basic conversion of single ask and bid pair', () => {
    const orderBook = {
      asks: [ genOrder('a', 4.5, 3.9), genOrder('c', 2.9, 1) ],
      bids: [ genOrder('b', 4.5, 3.9) ],
    };
    const result = getTradesFromOrders(orderBook);
    expect(result).to.deep.eq({
      sell: [ { exchangeId: 'b', price: 4.5, amount: 3.9 } ],
      buy: [
        { exchangeId: 'a', price: 4.5, amount: 3.9 },
        { exchangeId: 'c', price: 2.9, amount: 1 }
      ],
    });
  });
});
