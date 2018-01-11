const { expect } = require('chai');
const calcEarningsFromOrders = require('./calcEarningsFromOrders.js');

describe('Calculate Earnings From Orders', () => {
  describe('Unit tests', () => {
    it('Empty order book yields no profit', () => {
      const orderBook = { "asks": [], "bids": [] };
      const result = calcEarningsFromOrders(orderBook);
      expect(result).to.deep.eq({
        deltaByExchange: {},
        deltaA: 0,
        deltaB: 0,
        totalVolumeInA: 0,
        totalVolumeInB: 0,
        meanOrderPrice: 0,
        earnedValueInB: 0,
        marginOfVolumeTraded: 0,
      });
    });

    it('Basic single trade order book', () => {
      const orderBook = {
        "asks": [{exchangeId:"huobipro", amount: 5, priceWithFee: 0.25 }],
        "bids": [{exchangeId:"liqui", amount: 4, priceWithFee: 0.75 }]
      };
      const result = calcEarningsFromOrders(orderBook);
      expect(result).to.deep.eq({
        deltaByExchange: {
          liqui: { deltaA: -4, deltaB: 3 },
          huobipro: { deltaA: 5, deltaB: -1.25 }
        },
        deltaA: 1,
        deltaB: 1.75,
        totalVolumeInA: 9,
        totalVolumeInB: 4.25,
        meanOrderPrice: 4.25/9,
        earnedValueInB: 1.75 + 4.25/9,
        marginOfVolumeTraded: 52.28758169934641,
      });
    });
  });

  describe('Mock Data', () => {
    it('Mock data for arbitrage of TNT/BTC on Liqui/HuobiPro', () => {
      const orderBook = {
        "asks":[{exchangeId:"huobipro","price":0.00001979,amount:1336.70626612,priceWithFee:0.00001982958}],
        "bids":[{exchangeId:"liqui","price":0.00001993,amount:1336.70626612,priceWithFee:0.000019880175}]
      };
      const result = calcEarningsFromOrders(orderBook);
      expect(result).to.deep.eq({
        deltaByExchange: {
          liqui: { deltaA: -1336.70626612, deltaB: 0.026573954494062173 },
          huobipro: { deltaA: 1336.70626612, deltaB: -0.02650632384052783 }
        },
        deltaA: 0,
        deltaB: 0.00006763065353434378,
        totalVolumeInA: 2673.41253224,
        totalVolumeInB: 0.05308027833459,
        meanOrderPrice: 0.0000198548775,
        earnedValueInB: 0.00006763065353434378,
        marginOfVolumeTraded: 0.1274120175256729
      });
    });

    it('Mock data for arbitrage of STORJ/BTC on Liqui/HuobiPro', () => {
      const orderBook = {
        "asks":[{exchangeId:"huobipro","price":0.00015553,amount:1.57799655,priceWithFee:0.00015584106},{exchangeId:"huobipro","price":0.00015553,amount:2.29200345,priceWithFee:0.00015584106},{exchangeId:"huobipro","price":0.00015557,amount:16.59455122,priceWithFee:0.00015588114},{exchangeId:"huobipro","price":0.00015557,amount:60.66570728,priceWithFee:0.00015588114}],
        "bids":[{exchangeId:"liqui","price":0.00015686,amount:1.57799655,priceWithFee:0.00015646785000000002},{exchangeId:"liqui","price":0.00015683,amount:2.29200345,priceWithFee:0.000156437925},{exchangeId:"liqui","price":0.00015683,amount:16.59455122,priceWithFee:0.000156437925},{exchangeId:"liqui","price":0.0001568,amount:60.66570728,priceWithFee:0.000156408}]
      };
      const result = calcEarningsFromOrders(orderBook);
      expect(result).to.deep.eq({
        deltaByExchange: {
          liqui: { deltaA: -81.1302585, deltaB: 0.012690081094710016 },
          huobipro: { deltaA: 81.1302585, deltaB: -0.012646522073874691 }
        },
        deltaA: 0,
        deltaB: 0.00004355902083532509,

        totalVolumeInA: 162.260517,
        totalVolumeInB: 0.02533660316858471,
        meanOrderPrice: 0.00015614767928161298,
        earnedValueInB: 0.00004355902083532509,
        marginOfVolumeTraded: 0.17192131299326924
      });
    });
  });
});
