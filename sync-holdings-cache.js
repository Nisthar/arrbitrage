const ccxt = require('ccxt');
const fs = require('fs');

const cachePath = './holdings.json';
if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

const HashMapCachedAsFile = require('./lib/HashMapCachedAsFile');
const { fetchBalances } = require('./simulation/fetchExchangeData');
const { exchangesWithAccounts } = require('./simulation/experimentConfigurations');

(async function main() {
  const symbolCache = new HashMapCachedAsFile(cachePath);
  const balances = await fetchBalances(exchangesWithAccounts);
  symbolCache.save(balances);
})();

process.on('unhandledRejection', r => console.log(r));
