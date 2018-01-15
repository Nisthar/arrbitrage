const ccxt = require('ccxt');
const fs = require('fs');

const HashMapCachedAsFile = require('./lib/HashMapCachedAsFile');
const { fetchExchanges } = require('./simulation/fetchExchangeData');

(async function main() {
  const cachePath = './symbols.json';
  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

  const symbolCache = new HashMapCachedAsFile(cachePath);
  const exchangeIds = ccxt.exchanges;
  const exchanges = await fetchExchanges(exchangeIds);
  const content = exchangeIds.reduce((current, id) => {
    current[id] = exchanges[id].symbols;
    return current;
  }, {});

  symbolCache.save(content);
})();

process.on('unhandledRejection', r => console.log(r));
