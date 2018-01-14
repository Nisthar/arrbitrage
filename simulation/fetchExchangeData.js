"use strict";

/*
Uses ccxt to load market information for a given exchange.
*/

const ccxt = require ('ccxt');
const credentials = require('./../credentials');

const exchangeCache = {};
const balanceCache = {};

async function fetchExchange(exchangeId) {
  if (!exchangeCache[exchangeId]) {
    const exchangeCredentials = credentials[exchangeId] || {};
    exchangeCache[exchangeId] = new ccxt[exchangeId](exchangeCredentials);
    exchangeCache[exchangeId].enableRateLimit = true;
    await execute(() => exchangeCache[exchangeId].loadMarkets());
  }

  return exchangeCache[exchangeId];
}

async function fetchOrderBooks(exchangeIds, symbol) {
  const promiseToFetchBooks = exchangeIds.map(id => fetchOrderBook(id, symbol));
  return (await Promise.all(promiseToFetchBooks)).reduce((cur, orderBook, index) => {
    const exchangeId = exchangeIds[index];
    cur[exchangeId] = orderBook;
    return cur;
  }, {});
}

async function fetchBalances(exchangeIds) {
  const promiseToFetchBalances = exchangeIds.map(id => fetchBalance(id));
  return (await Promise.all(promiseToFetchBalances)).reduce((cur, balance, index) => {
    const exchangeId = exchangeIds[index];
    cur[exchangeId] = balance;
    return cur;
  }, {});
}

async function fetchBalance(exchangeId) {
  if (!balanceCache[exchangeId]) {
    const exchange = await fetchExchange(exchangeId);
    const balance = await execute(() => exchange.fetchBalance());
    if (balance && balance.free) {
      balanceCache[exchangeId] = balance.free;
    } else {
      console.warn(`Unable to fetch balance for ${exchangeId}`)
      balanceCache[exchangeId] = {};
    }
  }
  
  return balanceCache[exchangeId];
}

async function fetchOrderBook(exchangeId, symbol) {
  const exchange = await fetchExchange(exchangeId);
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

async function executeTrade(exchangeId, orderType, amount, symbol, price) {
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
      if (e instanceof ccxt.DDoSProtection || e.message.includes ('ECONNRESET')) {
        console.warn('[DDoS Protection Error] ' + e.message)
      } else if (e instanceof ccxt.RequestTimeout) {
        console.warn('[Timeout Error] ' + e.message)
      } else if (e instanceof ccxt.AuthenticationError) {
        console.warn('[Authentication Error] ' + e.message)
      } else if (e instanceof ccxt.ExchangeNotAvailable) {
        console.warn('[Exchange Not Available Error] ' + e.message)
      } else if (e instanceof ccxt.ExchangeError) {
        console.warn('[Exchange Error] ' + e.message)
      } else {
        throw e;
      }
    }
  }

  return undefined;
}

module.exports = {
  executeTrade,
  executeTrades,
  fetchExchange,
  fetchBalance,
  fetchBalances,
  fetchOrderBooks,
};
