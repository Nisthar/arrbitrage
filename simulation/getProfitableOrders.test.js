const { expect } = require('chai');
const getProfitableOrders = require('./getProfitableOrders.js');
const genOrder = (price, amount) => ({amount, priceWithFee: price});
const emptyOrder = { asks: [], bids: [] };

describe('Get Profitable Orders', () => {
  describe('Unit tests for single exchange', () => {
    it('Empty orderbook has no profitable orders', () => {
      const orderBook = emptyOrder;
      const result = getProfitableOrders(orderBook);
      expect(result).to.deep.eq(emptyOrder);
    });

    it('Book with single ask has no profitable orders', () => {
      const orderBook = { asks: [ genOrder(1, 1) ], bids: [] };
      const result = getProfitableOrders(orderBook);
      expect(result).to.deep.eq(emptyOrder);
    });

    it('Not profitable order', () => {
      const orderBook = { asks: [ genOrder(5, 1) ], bids: [ genOrder(2, 1) ] };
      const result = getProfitableOrders(orderBook);
      expect(result).to.deep.eq(emptyOrder);
    });

    it('Book with single bid has no profitable orders', () => {
      const orderBook = { asks: [], bids: [ genOrder(1, 1) ] };
      const result = getProfitableOrders(orderBook);
      expect(result).to.deep.eq(emptyOrder);
    });

    it('Book with single matching ask/bid', () => {
      const orderBook = { asks: [ genOrder(1, 1) ], bids: [ genOrder(1.1, 1) ] };
      const result = getProfitableOrders(orderBook);
      expect(result.asks).to.deep.eq([ genOrder(1, 1) ]);
      expect(result.bids).to.deep.eq([ genOrder(1.1, 1) ]);
    });

    it('Partially profitable bid, fully profitable ask', () => {
      const orderBook = { asks: [ genOrder(1, 1) ], bids: [ genOrder(2, 2) ] };
      const result = getProfitableOrders(orderBook);
      expect(result.asks).to.deep.eq([ genOrder(1, 1) ]);
      expect(result.bids).to.deep.eq([ genOrder(2, 1) ]);
    });

    it('Partially profitable ask, fully profitable bid', () => {
      const orderBook = { asks: [ genOrder(1, 2) ], bids: [ genOrder(2, 1) ] };
      const result = getProfitableOrders(orderBook);
      expect(result.asks).to.deep.eq([ genOrder(1, 1) ]);
      expect(result.bids).to.deep.eq([ genOrder(2, 1) ]);
    });

    it('Multiple profitable and unprofitable orders', () => {
      const profitableAsks = [ genOrder(9, 3), genOrder(12, 2) ];
      const nonprofitableAsks = [ genOrder(15, 7) ];
      const profitableBids = [ genOrder(12.1, 2), genOrder(12.1, 3) ];
      const nonprofitableBids = [ genOrder(6, 1), genOrder(5, 1) ];
      const result = getProfitableOrders({
        asks: profitableAsks.concat(nonprofitableAsks),
        bids: profitableBids.concat(nonprofitableBids),
      });
      expect(result.asks).to.deep.eq([ genOrder(9, 2), genOrder(9, 1), genOrder(12, 2) ]);
      expect(result.bids).to.deep.eq([ genOrder(12.1, 2), genOrder(12.1, 1), genOrder(12.1, 2) ]);
    });

    it('Multiple profitable, partially profitable ask, and unprofitable', () => {
      const orderBook = {
        asks: [
          genOrder(10, 2), // profitable
          genOrder(10, 3), // partial
          genOrder(15, 1), // not profitable
        ],
        bids: [
          genOrder(14, 2), // profitable
          genOrder(11, 2), // profitable
          genOrder(9, 1), // not profitable
        ],
      };
      const result = getProfitableOrders(orderBook);
      expect(result.asks).to.deep.eq([orderBook.asks[0], genOrder(10, 2)]);
      expect(result.bids).to.deep.eq([orderBook.bids[0], orderBook.bids[1]]);
    });

    it('Multiple profitable, partially profitable bid, and unprofitable', () => {
      const orderBook = {
        asks: [
          genOrder(10, 2), // profitable
          genOrder(10, 3), // profitable
          genOrder(15, 1), // not profitable
        ],
        bids: [
          genOrder(14, 2), // profitable
          genOrder(11, 7), // partial
          genOrder(9, 1), // not profitable
        ],
      };
      const result = getProfitableOrders(orderBook);
      expect(result.asks).to.deep.eq([orderBook.asks[0], orderBook.asks[1]]);
      expect(result.bids).to.deep.eq([orderBook.bids[0], genOrder(11, 3)]);
    });
  });
});