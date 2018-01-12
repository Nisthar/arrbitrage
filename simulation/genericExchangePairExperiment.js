'use strict';

const ccxt = require ('ccxt');

const { getExchange } = require('./fetchExchangeData');

async function genericExchangePairExperiment(settings) {
  const { exchangeIds, symbolFilter } = settings;
  const exchanges = {};
  for (let id of exchangeIds) {
    exchanges[id] = await getExchange(id);
  }
  
  // get all unique symbols
  const uniqueSymbols = ccxt.unique (ccxt.flatten (exchangeIds.map (id => exchanges[id].symbols))).filter(s => !symbolFilter || symbolFilter(s));

  // filter out symbols that are not present on at least two exchanges
  const arbitrableSymbols = uniqueSymbols
    .filter (symbol => 
        exchangeIds.filter (id => 
            (exchanges[id].symbols.indexOf (symbol) >= 0)).length > 1)
    .sort ((id1, id2) => (id1 > id2) ? 1 : ((id2 > id1) ? -1 : 0));

  return {
    exchangeIds,
    symbols: arbitrableSymbols,
  };
}

module.exports = genericExchangePairExperiment;
