const { fetchBalance } = require('./fetchExchangeData.js');

async function getHoldingsOnExchange(exchangeIds, symbol) {
  const slashPosition = symbol.indexOf('/');
  if (slashPosition <= 0) throw `Invalid symbol: ${symbol}`;
  const currencyA = symbol.substring(0, slashPosition);
  const currencyB = symbol.substring(slashPosition + 1, symbol.length);

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
