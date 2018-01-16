"use strict";

/*
Uses ccxt to load market information for a given exchange.
*/

const ccxt = require('ccxt');
const credentials = require('./../credentials');
const HashMapCachedAsFile = require('./../lib/HashMapCachedAsFile');

const exchangeCache = {};

const holdingCacheMiss = async exchangeId => {
  console.log(`Balance cache miss for ${exchangeId}`);
  const exchange = await fetchExchange(exchangeId);
  const balance = await execute(() => exchange.fetchBalance());
  if (balance && balance.free) {
    return balance.free;
  }

  console.warn(`Unable to fetch balance for ${exchangeId}`)
  return undefined;
};
const holdingCache = new HashMapCachedAsFile('./holdings.json', holdingCacheMiss);
holdingCache.load();

async function fetchExchange(exchangeId) {
  if (!exchangeCache[exchangeId]) {
    const exchangeCredentials = credentials[exchangeId] || {};
    exchangeCache[exchangeId] = new ccxt[exchangeId](exchangeCredentials);
    exchangeCache[exchangeId].enableRateLimit = true;
    await execute(() => exchangeCache[exchangeId].loadMarkets());
  }

  return exchangeCache[exchangeId];
}

async function fetchBalance(exchangeId, useCache) {
  return useCache !== undefined && !useCache ? await holdingCacheMiss(exchangeId) : await holdingCache.get(exchangeId);
}

async function adjustCurrencyBalanceOnSpend(exchangeId, currency, amount) {
  /*
  We must reload the cache just in case it was written to during the execution. 
  This is ghetto and we should really use data bases or just be a better programmer and long-haul.
  */
  holdingCache.load();

  const balance = await holdingCache.get(exchangeId);
  const currencyBalance = balance[currency] || 0;
  balance[currency] = currencyBalance - amount * 1.1;

  holdingCache.set(exchangeId, balance);
}

async function fetchOrderBook(exchangeId, symbol) {
  const exchange = await fetchExchange(exchangeId);
  if (!exchange.markets[symbol]) {
    return {};
  }

  const orderBook = await execute(() => exchange.fetchL2OrderBook(symbol));
  if (!orderBook) return undefined;

  const feeRate = exchange.markets[symbol].taker;
  const mapOrderToObject = (order, activeFeeRate) => {
    const fee = exchange.feeToPrecision(symbol, activeFeeRate * order[0]);
  
    return {
      exchangeId,
      price: order[0],
      amount: order[1],
      priceWithFee: order[0] + fee,
    };
  }

  return {
    bids: orderBook.bids.map(o => mapOrderToObject(o, -feeRate)),
    asks: orderBook.asks.map(o => mapOrderToObject(o, feeRate)),
  };
}

async function getTradeLimits(exchangeIds, symbol) {
  const exchanges = await fetchExchanges(exchangeIds);
  return exchangeIds.reduce((aggregate, id) => {
    aggregate[id] = exchanges[id].markets[symbol] && exchanges[id].markets[symbol].limits;
    return aggregate;
  }, {});
}

async function executeTrade(exchangeId, orderType, amount, symbol, price) {
  console.log(`Executing trade ${JSON.stringify(arguments)}`);

  if (!['buy', 'sell'].some(o => orderType === o)) throw '[Execute Trade] Invalid order type';
  if (Number.isNaN(amount) || amount < 0) throw '[Execute Trade] Invalid amount';
  if (symbol.length < 6 || symbol.length > 9 || !symbol.includes('/')) throw '[Execute Trade] Invalid symbol';
  if (Number.isNaN(price)) throw '[Execute Trade] Invalid price'; 

  const exchange = await fetchExchange(exchangeId);

  if (orderType === 'buy') {
    return await execute(() => exchange.createLimitBuyOrder(symbol, amount, price));
  }

  if (orderType === 'sell') {
    return await execute(() => exchange.createLimitSellOrder(symbol, amount, price));
  }

  throw 'wtf';
}

async function fetchExchanges(exchangeIds) {
  console.log(`Fetching exchange data for ${exchangeIds}`);
  const promiseToFetchExchange = exchangeIds.map(id => fetchExchange(id));
  return (await Promise.all(promiseToFetchExchange)).reduce((cur, exchange, index) => {
    const exchangeId = exchangeIds[index];
    cur[exchangeId] = exchange;
    return cur;
  }, {});
}

async function fetchOrderBooks(exchangeIds, symbol) {
  const promiseToFetchBooks = exchangeIds.map(id => fetchOrderBook(id, symbol));
  return (await Promise.all(promiseToFetchBooks)).reduce((cur, orderBook, index) => {
    const exchangeId = exchangeIds[index];
    cur[exchangeId] = orderBook;
    return cur;
  }, {});
}

async function fetchBalances(exchangeIds, useCache) {
  const promiseToFetchBalances = exchangeIds.map(id => fetchBalance(id, useCache));
  return (await Promise.all(promiseToFetchBalances)).reduce((cur, balance, index) => {
    const exchangeId = exchangeIds[index];
    cur[exchangeId] = balance;
    return cur;
  }, {});
}

async function executeTrades(trades, symbol) {
  const ids = [];
  const doExecute = async (trade, orderType) => {
    const { exchangeId, amount, price } = trade;
    return executeTrade(exchangeId, orderType, amount, symbol, price);
  };

  return Promise.all([
    ...trades.buy.map(t => doExecute(t, 'buy'), ),
    ...trades.sell.map(t => doExecute(t, 'sell'), ),
  ]);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function execute(func, maxRetries = 10, sleepBeforeRequests = 1000) {
  for (let numRetries = 0; numRetries < maxRetries; numRetries++) {
    try {
      await sleep(sleepBeforeRequests);
      return await func();
    } catch (e) {
      // swallow connectivity exceptions only
      if (e instanceof ccxt.DDoSProtection || e.message.includes('ECONNRESET')) {
        console.warn('[DDoS Protection Error] ' + e.message)
      } else if (e instanceof ccxt.RequestTimeout) {
        console.warn('[Timeout Error] ' + e.message)
      } else if (e instanceof ccxt.AuthenticationError) {
        console.warn('[Authentication Error] ' + e.message)
      } else if (e instanceof ccxt.ExchangeNotAvailable) {
        console.warn('[Exchange Not Available Error] ' + e.message)
      } else if (e instanceof ccxt.ExchangeError) {
        console.warn('[Exchange Error] ' + e.message);
        return undefined;
      } else {
        throw e;
      }
    }
  }

  return undefined;
}

module.exports = {
  adjustCurrencyBalanceOnSpend,
  executeTrade,
  executeTrades,
  fetchExchange,
  fetchExchanges,
  fetchBalance,
  fetchBalances,
  fetchOrderBook,
  fetchOrderBooks,
  getTradeLimits,
};
