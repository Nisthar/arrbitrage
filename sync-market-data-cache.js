const ccxt = require('ccxt');
const fs = require('fs');

const cachePath = process.argv[2] || './market-data.json';
if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

const HashMapCachedAsFile = require('./lib/HashMapCachedAsFile');
const { fetchExchanges } = require('./simulation/fetchExchangeData');

(async function main() {
  const exchangeDataCache = new HashMapCachedAsFile(cachePath);
  const exchangeIds = ccxt.exchanges;
  const exchanges = await fetchExchanges(exchangeIds);
  await Promise.all(exchangeIds.map(id => {
    try {
      exchanges[id].loadMarkets();
    } catch (e) {
      console.warn(e);
    }
  }));

  const content = exchangeIds.reduce((current, exchangeId) => {
    const exchange = exchanges[exchangeId];
    const exchangeData = {
      exchangeId,
      symbols: exchange.symbols,
    };

    if (exchangeData.symbols) {
      exchange.symbols.forEach(symbol => exchangeData[symbol] = {
        symbol,
        taker: exchange.markets[symbol].taker,
        limits: exchange.markets[symbol].limits,
      });
    }

    current[exchangeId] = exchangeData;
    return current;
  }, {});

  exchangeDataCache.save(content);
})();

process.on('unhandledRejection', r => console.log(r));
