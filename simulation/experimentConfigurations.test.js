const { expect } = require('chai');
const { isFiatMarket } = require('./experimentConfigurations.js');

describe('Experiment configuration', () => {
  it('isFiatMarket', () => {
    expect(isFiatMarket('ABC/USD')).to.eq(true);
    expect(isFiatMarket('ABC/EUR')).to.eq(true);
    expect(isFiatMarket('ABC/USDT')).to.eq(false);
    expect(isFiatMarket('ABC/BTC')).to.eq(false);
  });
});