const { expect } = require('chai');
const sinon = require('sinon');

const HashMapCachedAsFile = require('./HashMapCachedAsFile');

describe('Hash map cached as file', () => {
  const generateAsyncStub = x => {
    const stub = sinon.stub().returns(x);
    const asyncStub = async a => stub(a);

    return { stub, asyncStub };
  };

  it('Cache missing and cache hit', (done) => {
    (async () => {
      const { stub, asyncStub} = generateAsyncStub('foo');
      const test = new HashMapCachedAsFile('./test.json', asyncStub);
      expect(await test.get('foo')).to.eq('foo');
      expect(stub.calledOnce).to.eq(true);

      expect(await test.get('foo')).to.eq('foo');
      expect(stub.calledOnce).to.eq(true);
      done();
    })();
  });

  it('Cache update, hit, reload, hit', (done) => {
    (async () => {
      const { stub, asyncStub} = generateAsyncStub('miss');
      const test = new HashMapCachedAsFile('./test.json', asyncStub);
      
      test.set('foo', 'bar');

      expect(await test.get('foo')).to.eq('bar');
      expect(stub.called).to.eq(false);

      test.load();
      expect(await test.get('foo')).to.eq('bar');
      expect(stub.called).to.eq(false);

      done();
    })();
  });
});
