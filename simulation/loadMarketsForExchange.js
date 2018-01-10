"use strict";

/*
Uses ccxt to load market information for a given exchange.

{
  fees: {
    trading: {
      maker: 0.0015,
      taker: 0.0015,
    }
  },
  markets: {
    'ETH/BAT': {
      limits: {},
      maker: 0.0015,
      taker: 0.0015,
      info: {},
      active: true,
    }
  },
  marketsById: {
    'LTC': {},
  },
  symbols: {},
  ids: {},
}
*/

const ccxt = require ('ccxt');

let proxies = [
  '', // no proxy by default
  'https://crossorigin.me/',
  'https://cors-anywhere.herokuapp.com/',
]

async function loadMarketForExchanges(exchangeIds) {
  const exchanges = {};
  for (let id of exchangeIds) {
    exchanges[id] = await loadMarketForExchange(id);
  }

  return exchanges;
}

async function loadMarketForExchange(id) {
  console.log(`Loading market data for exchange ${id}`);

  const exchange = new ccxt[id]();

  // load all markets from the exchange
  const markets = await exchange.loadMarkets();
  const orderBook = await exchange.fetchL2OrderBook('EOS/KRW');

  return { exchange, markets, orderBook };
}

(async function main(){
  const market = await loadMarketForExchange('bithumb');
  console.log(JSON.stringify(market.orderBook, null, 2));
})();

exports.loadMarketForExchange = loadMarketForExchange;
exports.loadMarketForExchanges = loadMarketForExchanges;

