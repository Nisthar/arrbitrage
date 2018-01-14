const { fetchBalance } = require('./fetchExchangeData.js');

async function getHoldingsOnExchange(exchangeIds, currencies) {
  const [ currencyA, currencyB ] = currencies;
  const result = { currencyA, currencyB };
  for (let exchangeId of exchangeIds) {
    const balance = await fetchBalance(exchangeId) || {};
    result[exchangeId] = [
      balance[currencyA] || 0,
      balance[currencyB] || 0
    ];
  }

  return result;
}

module.exports = getHoldingsOnExchange;
