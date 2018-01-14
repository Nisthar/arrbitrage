const { expect } = require('chai');
const getFulfillableOrders = require('./getFulfillableOrders');
const genOrder = (price, amount) => ({amount, priceWithFee: price});

const mockExchangeOne = {
  A: {
    bids: [genOrder(4, 1), genOrder(3, 1)],
    asks: [genOrder(1, 1), genOrder(2, 1)],
  }
};

const mockExchangeTwo = {
  B: {
    bids: [genOrder(4.1, 3), genOrder(3.1, 4)],
    asks: [genOrder(1.1, 5), genOrder(2.5, 5)],
  }
};

const mockTwoExchanges = Object.assign({}, mockExchangeOne, mockExchangeTwo);

describe('Get fulfillable orders', () => {
  describe('Unit tests for single exchange', () => {
    it('No holdings yield no orders', () => {
      const holdings = { A: [ 0, 0 ] };
      const result = getFulfillableOrders(mockExchangeOne, holdings);
      expect(result).to.deep.eq({ asks: [], bids: [] });
    });

    it('Low holding yields fractional orders', () => {
      const holdings = { A: [ 1, 0.5 ] };
      const result = getFulfillableOrders(mockExchangeOne, holdings);
      expect(result.asks).to.deep.eq([ genOrder(1, 0.5) ]);
      expect(result.bids).to.deep.eq([ genOrder(4, 1) ]);
    });

    it('Healthy holding yields multiple orders', () => {
      const holdings = { A: [ 1.5, 2 ] };
      const result = getFulfillableOrders(mockExchangeOne, holdings);
      expect(result.asks).to.deep.eq([ genOrder(1, 1), genOrder(2, 0.5) ]);
      expect(result.bids).to.deep.eq([ genOrder(4, 1), genOrder(3, 0.5) ]);
    });

    it('Complete buyout of orders', () => {
      const holdings = { A: [ 10000, 10000 ] };
      const result = getFulfillableOrders(mockExchangeOne, holdings);
      expect(result.asks).to.deep.eq([ genOrder(1, 1), genOrder(2, 1) ]);
      expect(result.bids).to.deep.eq([ genOrder(4, 1), genOrder(3, 1) ]);
    });
  });

  describe('Unit tests for exchange pair', () => {
    it('No holdings yield no orders', () => {
      const holdings = { A: [ 0, 0 ], B: [ 0, 0 ] };
      const result = getFulfillableOrders(mockTwoExchanges, holdings);
      expect(result).to.deep.eq({ asks: [], bids: [] });
    });

    it('Partial fulfillment of orders', () => {
      const holdings = { A: [ 1.5, 2.5 ], B: [ 3, 6.75 ] };
      const result = getFulfillableOrders(mockTwoExchanges, holdings);
      expect(result.asks).to.deep.eq([ genOrder(1, 1), genOrder(1.1, 5), genOrder(2, 1.5/2), genOrder(2.5, (6.75 - 5.5)/2.5) ]);
      expect(result.bids).to.deep.eq([ genOrder(4.1, 3), genOrder(4, 1), genOrder(3, 0.5) ]);
    });

    it('Complete buyout of orders across exchanges', () => {
      const holdings = { A: [ 10000, 10000 ], B: [ 10000, 10000 ] };
      const result = getFulfillableOrders(mockTwoExchanges, holdings);
      expect(result.asks).to.deep.eq([ genOrder(1, 1), genOrder(1.1, 5), genOrder(2, 1), genOrder(2.5, 5) ]);
      expect(result.bids).to.deep.eq([ genOrder(4.1, 3), genOrder(4, 1), genOrder(3.1, 4), genOrder(3, 1) ]);
    });
  });

  describe('Mock Data', () => {
    const mockExchangeBooks = {
      liqui: {
        bids: [{"price":0.00058029,"amount":17.23276293,"priceWithFee":0.000578839275},{"price":0.00058028,"amount":432.35264712,"priceWithFee":0.0005788293},{"price":0.00057826,"amount":68.06702518,"priceWithFee":0.00057681435},{"price":0.00057682,"amount":495.6341077,"priceWithFee":0.0005753779500000001},{"price":0.00057481,"amount":496.55802343,"priceWithFee":0.0005733729750000001}],
        asks: [{"price":0.00058348,"amount":152.02530376,"priceWithFee":0.0005849387},{"price":0.00058435,"amount":493.41953741,"priceWithFee":0.000585810875},{"price":0.0005864,"amount":492.65364657,"priceWithFee":0.000587866},{"price":0.00058845,"amount":489.31582774,"priceWithFee":0.000589921125},{"price":0.00059051,"amount":487.70049494,"priceWithFee":0.000591986275}],
      },
      huobipro: {
        bids: [{"price":0.00056606,"amount":1352,"priceWithFee":0.00056492788},{"price":0.00056605,"amount":3405,"priceWithFee":0.0005649179},{"price":0.00056604,"amount":1687,"priceWithFee":0.0005649079199999999},{"price":0.00056602,"amount":141,"priceWithFee":0.00056488796},{"price":0.00056601,"amount":22984,"priceWithFee":0.0005648779800000001}],
        asks: [{"price":0.000579,"amount":9,"priceWithFee":0.000580158},{"price":0.00058409,"amount":1309,"priceWithFee":0.00058525818},{"price":0.0005841,"amount":4700,"priceWithFee":0.0005852682000000001},{"price":0.00058411,"amount":504,"priceWithFee":0.0005852782199999999},{"price":0.00060113,"amount":291,"priceWithFee":0.00060233226}],
      }
    };
      
    it('Mock Liqui + HerobiPro BAT/ETH Order Book', () => {
      const mockHoldings = {
        liqui: [ 17, 0.5 ],
        huobipro: [ 1353, 0.5 ],
      };

      const result = getFulfillableOrders(mockExchangeBooks, mockHoldings);
      expect(result.asks[0]).to.deep.eq(mockExchangeBooks.huobipro.asks[0]);
      expect(result.asks[1]).to.deep.eq(mockExchangeBooks.liqui.asks[0]);
      expect(result.asks[2].price).to.deep.eq(mockExchangeBooks.huobipro.asks[1].price);
      expect(result.asks[2].amount).to.lt(mockExchangeBooks.huobipro.asks[1].amount);

      expect(result.bids[0].price).to.eq(mockExchangeBooks.liqui.bids[0].price);
      expect(result.bids[0].amount).to.eq(mockHoldings.liqui[0]);
      expect(result.bids[1]).to.deep.eq(mockExchangeBooks.huobipro.bids[0]);
      expect(result.bids[2].price).to.eq(mockExchangeBooks.huobipro.bids[1].price);
      expect(result.bids[2].amount).to.eq(1);
    });
  });
});
