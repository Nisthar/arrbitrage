const { expect } = require('chai');
const sinon = require('sinon');
const getHoldingsOnExchange = require('./getHoldingsOnExchange');

describe('Get holdings on exchange', () => {
  it('Balance properly propogating', (done) => {
    const exchangeIds = [ 'A', 'B' ];
    const fetch = sinon.stub().returns({
      a: 1,
      b: 2,
    });

    (async () => {
      const result = await getHoldingsOnExchange(exchangeIds, [ 'a', 'b' ], fetch);
      expect(fetch.callCount).to.eq(exchangeIds.length);
      expect(result).to.deep.eq({
        currencyA: 'a',
        currencyB: 'b',
        A: [1,2],
        B: [1,2],
      });
      done();
    })();
  });

  it('Fetch yields undefined currency balance, 0 balance for currency', (done) => {
    const exchangeIds = [ 'A', 'B' ];
    const fetch = sinon.stub().returns({
      a: 1,
    });

    (async () => {
      const result = await getHoldingsOnExchange(exchangeIds, [ 'a', 'b' ], fetch);
      expect(fetch.callCount).to.eq(exchangeIds.length);
      expect(result).to.deep.eq({
        currencyA: 'a',
        currencyB: 'b',
        A: [1,0],
        B: [1,0],
      });
      done();
    })();
  });

  it('Fetch yields undefined, 0 balance', (done) => {
    const exchangeIds = [ 'A', 'B' ];
    const fetch = sinon.stub().returns(undefined);

    (async () => {
      const result = await getHoldingsOnExchange(exchangeIds, [ 'a', 'b' ], fetch);
      expect(fetch.callCount).to.eq(exchangeIds.length);
      console.log(JSON.stringify(result));
      expect(result).to.deep.eq({
        currencyA: 'a',
        currencyB: 'b',
        A: [0,0],
        B: [0,0],
      });
      done();
    })();
  });
});