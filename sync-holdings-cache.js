const ccxt = require('ccxt');
const fs = require('fs');

const cachePath = process.argv[2] || './holdings.json';
if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

const HashMapCachedAsFile = require('./lib/HashMapCachedAsFile');
const { fetchBalances } = require('./simulation/fetchExchangeData');
const { exchangesWithAccounts } = require('./simulation/experimentConfigurations');

(async function main() {
  const symbolCache = new HashMapCachedAsFile(cachePath);
  const balances = await fetchBalances(exchangesWithAccounts, false);
  symbolCache.save(balances);
})();

process.on('unhandledRejection', r => console.log(r));
