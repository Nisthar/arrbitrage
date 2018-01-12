const { fetchBalance } = require('./fetchExchangeData.js');

async function getHoldingsOnExchange(exchangeIds, symbol) {
  const slashPosition = symbol.indexOf('/');
  if (slashPosition <= 0) throw `Invalid symbol: ${symbol}`;
  const symA = symbol.substring(0, slashPosition);
  const symB = symbol.substring(slashPosition + 1, symbol.length);

  const result = {};
  for (let exchangeId of exchangeIds) {
    const balance = await fetchBalance(exchangeId) || {};
    result[exchangeId] = [
      balance[symA] || 0,
      balance[symB] || 0
    ];
  }

  return result;
}

module.exports = getHoldingsOnExchange;
