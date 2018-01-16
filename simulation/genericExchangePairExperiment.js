'use strict';

const ccxt = require ('ccxt');

const { getMarketData, fetchBalances } = require('./fetchExchangeData');

async function genericExchangePairExperiment(settings) {
  const { exchangeIds, symbolFilter } = settings;
  const markets = getMarketData();
  
  // get all unique symbols
  const allSymbols = exchangeIds.map(id => markets[id].symbols).reduce((aggregate, symbols) => {
    const acceptableSymbols = symbols && symbols.filter(s => !s.endsWith('.d') && (!symbolFilter || symbolFilter(s)));
    if (symbols) aggregate = aggregate.concat(acceptableSymbols);
    return aggregate;
  }, []);
  const uniqueSymbols = Array.from(new Set(allSymbols));

  // filter out symbols that are not present on at least two exchanges
  let arbitrableSymbols = uniqueSymbols
    .filter (symbol => exchangeIds.filter(id => (markets[id] && markets[id].symbols && markets[id].symbols.indexOf (symbol) >= 0)).length > 1)
    .sort ((id1, id2) => (id1 > id2) ? 1 : ((id2 > id1) ? -1 : 0));

  if (settings.useHeldCurrencies) {
    const exchangeHoldings = await fetchBalances(exchangeIds);
    const heldCurrencies = Array.from(exchangeIds.reduce((current, exchangeId) => {
      const balance = exchangeHoldings[exchangeId];
      Object.keys(balance).filter(c => balance[c] !== 0).forEach(currency => current.add(currency));
      return current;
    }, new Set()));

    const isAcceptedCurrencies = (symbol) => heldCurrencies.some(c => symbol.startsWith(`${c}/`)) && heldCurrencies.some(c => symbol.endsWith(`/${c}`));
    arbitrableSymbols = arbitrableSymbols.filter(s => isAcceptedCurrencies(s));
  }

  return Object.assign(settings, {
    exchangeIds,
    symbols: arbitrableSymbols,
  });
}

module.exports = genericExchangePairExperiment;
