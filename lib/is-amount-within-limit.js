function isAmountWithinLimits(limits, exchangeId, amount, price) {
  if (!limits || !limits[exchangeId]) return true;
  
  const amountWithinLimit = 
    amount === undefined || 
    limits[exchangeId].amount === undefined ||
    (
      (!limits[exchangeId].amount.min || amount > limits[exchangeId].amount.min) &&
      (!limits[exchangeId].amount.max || amount < limits[exchangeId].amount.max)
    );
  
  const priceWithinLimit = 
    price === undefined ||
    limits[exchangeId].price === undefined ||
    (
      (!limits[exchangeId].price.min || price > limits[exchangeId].price.min) &&
      (!limits[exchangeId].price.max || price < limits[exchangeId].price.max)
    );

  return amountWithinLimit && priceWithinLimit;
}

module.exports = isAmountWithinLimits;
