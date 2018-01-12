"use strict";

/*
Uses ccxt to load market information for a given exchange.
*/

const ccxt = require ('ccxt');

const exchangeCache = {};

async function getExchange(exchangeId) {
  if (!exchangeCache[exchangeId]) {
    console.log(`Loading market data for exchange ${exchangeId}`);
    exchangeCache[exchangeId] = new ccxt[exchangeId]();
    await execute(() => exchangeCache[exchangeId].loadMarkets());
  }

  return exchangeCache[exchangeId];
}

async function fetchOrderBooks(exchangeIds, symbol) {
  const exchanges = {};
  for (let id of exchangeIds) {
    const exchange = await fetchOrderBook(id, symbol);
    if (exchange) {
      exchanges[id] = exchange;
    } 
  }

  return exchanges;
}

async function fetchOrderBook(exchangeId, symbol) {
  const exchange = await getExchange(exchangeId);
  if (!exchange.markets[symbol]) {
    return {};
  }
  
  const orderBook = await execute(() => exchange.fetchL2OrderBook(symbol));
  if (!orderBook) return undefined;

  const takerFee = exchange.markets[symbol].taker;

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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function execute(func, maxRetries = 10, sleepBeforeRequests = 200) {
  for (let numRetries = 0; numRetries < maxRetries; numRetries++) {
    try {
      await sleep(sleepBeforeRequests);
      return await func();
    } catch (e) {
      // swallow connectivity exceptions only
      if (e instanceof ccxt.DDoSProtection || e.message.includes ('ECONNRESET')) {
        // console.warn('[DDoS Protection Error] ' + e.message)
      } else if (e instanceof ccxt.RequestTimeout) {
        // console.warn('[Timeout Error] ' + e.message)
      } else if (e instanceof ccxt.AuthenticationError) {
        // console.warn('[Authentication Error] ' + e.message)
      } else if (e instanceof ccxt.ExchangeNotAvailable) {
        // console.warn('[Exchange Not Available Error] ' + e.message)
      } else if (e instanceof ccxt.ExchangeError) {
        // console.warn('[Exchange Error] ' + e.message)
      } else {
        throw e;
      }
    }
  }

  return undefined;
  throw 'Failed to execute function';
}

module.exports = {
  getExchange,
  fetchOrderBooks,
};