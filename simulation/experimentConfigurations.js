const genericExchangePairExperiment = require('./genericExchangePairExperiment');

const considerableHoldings = {};

/* Removed 'ccex', 'zb' */
const cryptoToCryptoExchanges = [
  'allcoin', 'binance', 'bitbay', 'bitcoincoid', 'bitfinex2', 'bitflyer', 'bitlish', 'bitso', 'bitstamp', 'bitstamp', 'bittrex', 'bleutrade', 'btcexchange', 'btcmarkets', 'btcturk', 'bxinth', 'cex', 
  'cryptopia', 'dsx', 'exmo', 'gatecoin', 'gateio', 'gdax', 'gemini', 'hitbtc2', 'huobipro', 'kucoin', 'lakebtc', 'liqui', 'livecoin', 'mixcoins', 'poloniex', 'qryptos', 'quadrigacx', 'quoine', 
  'southxchange', 'therock', 'tidex', 'wex', 'zaif'
];

// Removed 'cryptopia', 'quadrigacx',
const exchangesWithAccounts = ['gateio', 'huobipro', 'liqui', 'bleutrade', 'binance'];

// const heldCurrencies = ['NEO', 'BTC', 'ETH', 'BAT', 'AST', 'RCN', 'GNT', 'REP', 'GNO', 'STORJ', 'BNT', 'MTX', 'BTG', 'KIN', 'LTC', 'DOGE', 'XLM', 'USDT', 'XMR' ];
const heldCurrencies = ['AST', 'BAT', 'BCD', 'BNT', 'BTC', 'BTG', 'ETH', 'GNT', 'REP', 'STORJ'];
const isAcceptedCurrencies = (symbol) => heldCurrencies.some(c => symbol.startsWith(`${c}/`)) && heldCurrencies.some(c => symbol.endsWith(`/${c}`));
const isFiatMarket = (symbol) => ['USD', 'CAD', 'EUR', 'NZD', 'SGD', 'RUB', 'RUR', 'AUD', 'GBP', 'HKD', 'JPY' ].some(c => symbol.endsWith(`/${c}`));

async function getExperimentConfiguration(name) {
  const configurations = {
    scan: async () => await genericExchangePairExperiment({
      exchangeIds : process.argv.length > 2 && process.argv.slice(3),
      logSummaryTable: true,
      infiniteHoldings: true,
      logTradeDescriptions: true,
    }),
    scanc2c: async () => await genericExchangePairExperiment({
      exchangeIds: cryptoToCryptoExchanges,
      symbolFilter: s => !isFiatMarket(s),
      logSummaryTable: true,
      infiniteHoldings: true,
      logTradeDescriptions: true,
    }),
    infinite: async () => await genericExchangePairExperiment({
      exchangeIds: exchangesWithAccounts,
      symbolFilter: sym => !isFiatMarket(sym) && isAcceptedCurrencies(sym),
      logSummaryTable: true,
      infiniteHoldings: true,
      logTradeDescriptions: true,
    }),
    deep: {
      exchangeIds: process.argv.length > 3 && process.argv[3].split(','),
      symbols: process.argv.length > 3 && process.argv[4].split(','),
      logDetailedTrades: true,
      logTradeDescriptions: true,
    },
    real: async () => await genericExchangePairExperiment({
      exchangeIds: exchangesWithAccounts,
      symbolFilter: sym => !isFiatMarket(sym) && isAcceptedCurrencies(sym),
      logDetailedTrades: false,
      logTradeDescriptions: true,
      logSummaryTable: false,
    }),
  };

  let config = configurations[name];
  if (typeof config === 'function') {
    const result = config.constructor.name === 'AsyncFunction' ? await config() : config();
    if (!result.holdings) {
      result.holdings = considerableHoldings;
    }

    config = result;
  }
  
  return config;
}

module.exports = {
  exchangesWithAccounts,
  getExperimentConfiguration,
  isFiatMarket,
  heldCurrencies,
};
