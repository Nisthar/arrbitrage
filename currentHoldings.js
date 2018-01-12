const { exchangesWithAccounts } = require('./simulation/experimentConfigurations.js');
const { fetchBalance } = require('./simulation/fetchExchangeData.js');

const asTable = require('as-table');

(async function main() {
  const rows = [];
  const currencies = new Set();
  for (const id of exchangesWithAccounts) {
    const balance = await fetchBalance(id);
    if (balance) {
      Object.keys(balance).filter(c => balance[c] !== 0).forEach(currency => currencies.add(currency));
    }
  }

  for (const exchangeId of exchangesWithAccounts) {
    const row = { exchangeId };
    const balance = await fetchBalance(exchangeId);
    currencies.forEach(c => row[c] = balance[c]);
    rows.push(row);
  }

  console.log(asTable(rows));
})();

process.on('unhandledRejection', r => console.log(r));
