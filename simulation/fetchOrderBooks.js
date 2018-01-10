"use strict";

/*
Uses ccxt to load market information for a given exchange.
*/

const ccxt = require ('ccxt');

async function fetchOrderBooks(exchangeIds, symbol) {
  const exchanges = {};
  for (let id of exchangeIds) {
    exchanges[id] = await fetchOrderBook(id, symbol);
  }

  return exchanges;
}

async function fetchOrderBook(exchangeId, symbol) {
  console.log(`Loading market data for exchange ${exchangeId}`);
  const exchange = new ccxt[exchangeId]();
  const markets = await exchange.loadMarkets();
  const takerFee = exchange.markets[symbol].taker; 
  const orderBook = await exchange.fetchL2OrderBook(symbol);

  const mapOrderToObject = (order, fee) => ({
    exchangeId,
    price: order[0],
    amount: order[1],
    priceWithFee: order[0] * (1 + fee),
  });

  return {
    bids: orderBook.bids.map(o => mapOrderToObject(o, -takerFee)),
    asks: orderBook.asks.map(o => mapOrderToObject(o, takerFee)),
  };
}

module.exports = fetchOrderBooks;
