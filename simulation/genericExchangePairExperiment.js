'use strict';

const ccxt = require ('ccxt');

const { getExchange } = require('./fetchExchangeData');

async function genericExchangePairExperiment() {
  const ids = process.argv.slice(3);
  const exchangeIds = ids.reduce(async (prev, id) => {
    prev[id] = await getExchange(id);
    return prev;
  }, {});

  // get all unique symbols
  const uniqueSymbols = ccxt.unique (ccxt.flatten (ids.map (id => exchangeIds[id].symbols)));

  // filter out symbols that are not present on at least two exchanges
  const arbitrableSymbols = uniqueSymbols
    .filter (symbol => 
        ids.filter (id => 
            (exchangeIds[id].symbols.indexOf (symbol) >= 0)).length > 1)
    .sort ((id1, id2) => (id1 > id2) ? 1 : ((id2 > id1) ? -1 : 0));

  return {
    exchangeIds,
    symbols: arbitrableSymbols,
  };
}

module.exports = genericExchangePairExperiment;
