const ccxt = require('ccxt');
const { getMarketData } = require('./simulation/fetchExchangeData');
const { exchangesWithAccounts, parseCurrenciesFromSymbol } = require('./simulation/experimentConfigurations');
const usdValues = require('./simulation/cryptoValuation');

(async function main() {
  const currency = process.argv[2];
  const markets = getMarketData();

  const result = await Promise.all (exchangesWithAccounts.map (exchangeId =>
    new Promise (async (resolve, reject) => {
      const market = markets[exchangeId];
      const symbols = market.symbols.filter(sym => sym.startsWith(`${currency}/`));
      const symbolValue = await Promise.all(symbols.map(symbol => 
        new Promise(async (resolve, reject) => {
          const currencyB = parseCurrenciesFromSymbol(symbol)[1];
          const usdPriceOfB = usdValues[currencyB];

          const exchange = new ccxt[exchangeId]();
          const ticker = await exchange.fetchTicker (symbol)
          resolve({ exchangeId, symbol, usdPrice: ticker.ask * usdPriceOfB });
        })
      ));

      resolve(symbolValue);
    })
  ));

  console.log(`[${JSON.stringify(result, null, 2)}] trade ${currency}`);
})();

process.on('unhandledRejection', r => console.log(r));
