const { executeTrade, fetchOrder } = require('./simulation/fetchExchangeData');

const usage = `node execute exchangeId buy/sell amount symbol price
eg. node execute bleutrade buy 5 ABC/BTC 1`;

const [exchangeId, orderType, amount, symbol, price] = process.argv.splice(2);

(async function main() {
  const executed = await executeTrade(exchangeId, orderType, amount, symbol, price);
  console.log(executed.id);

  // const { id }= executed;
  // const { result, message } = executed.info;
  // if (result !== 'true') {
  //   return console.error(`Failed: ${message}`);
  // }

  // // do {
  // //   const order = await fetchOrder(exchangeId, id);
  // //   console.log(JSON.stringify(order));
  // // } while (false);
})();