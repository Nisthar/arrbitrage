const isAmountWithinLimits = require('./../lib/is-amount-within-limit');
const { fetchBalance, adjustCurrencyBalanceOnSpend } = require('./fetchExchangeData.js');

async function getHoldingsOnExchange(exchangeIds, currencies, limits, fetch = fetchBalance) {
  const [ currencyA, currencyB ] = currencies;
  const result = { currencyA, currencyB };
  for (let exchangeId of exchangeIds) {
    const balances = await fetch(exchangeId) || {};
    const balanceA = isAmountWithinLimits(limits, exchangeId, balances[currencyA]) ? balances[currencyA] : 0;
    result[exchangeId] = [ balanceA || 0, balances[currencyB] || 0 ];
  }

  return result;
}

async function adjustBalanceBasedOnSpending(trade, currencies, callback = adjustCurrencyBalanceOnSpend) {
  const { exchangeId, orderType } = trade;
  
  let currencySpent = undefined;
  let amountSpent = undefined;
  if (orderType === 'buy') {
    currencySpent = currencies[1];
    amountSpent = trade.amount * trade.price;
  } else if (orderType === 'sell') {
    currencySpent = currencies[0];
    amountSpent = trade.amount;
  } else {
    throw '[adjustBalanceBasedOnSpending] Invalid order type';
  }

  await callback(exchangeId, currencySpent, amountSpent);
}

module.exports = {
  getHoldingsOnExchange,
  adjustBalanceBasedOnSpending
};
