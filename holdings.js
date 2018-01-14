const { exchangesWithAccounts } = require('./simulation/experimentConfigurations');
const { fetchBalances } = require('./simulation/fetchExchangeData');

const asTable = require('as-table').configure({ delimiter: ';' });

(async function main() {
  const rows = [];
  const exchangeHoldings = await fetchBalances(exchangesWithAccounts);
  const currencies = Array.from(exchangesWithAccounts.reduce((current, exchangeId) => {
    const balance = exchangeHoldings[exchangeId];
    Object.keys(balance).filter(c => balance[c] !== 0).forEach(currency => current.add(currency));
    return current;
  }, new Set())).sort();

  for (const exchangeId of exchangesWithAccounts.sort()) {
    const row = currencies.reduce((current, currency) => {
      current[currency] = exchangeHoldings[exchangeId][currency];
      return current;
    }, { exchangeId });
    rows.push(row);
  }

  const header = [ 'exchangeId', ...currencies ];
  const sortedRows = rows.map(r => header.map(h => r[h]));
  console.log(asTable([ header, ...sortedRows ]));
})();

process.on('unhandledRejection', r => console.log(r));
