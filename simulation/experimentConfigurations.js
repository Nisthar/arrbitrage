const genericExchangePairExperiment = require('./genericExchangePairExperiment.js');

const considerableHoldings = {};

/* Removed 'ccex', 'zb' */
const cryptoToCryptoExchanges = [
  'allcoin', 'binance', 'bitbay', 'bitcoincoid', 'bitfinex2', 'bitflyer', 'bitlish', 'bitso', 'bitstamp', 'bitstamp', 'bittrex', 'bleutrade', 'btcexchange', 'btcmarkets', 'btcturk', 'bxinth', 'cex', 
  'cryptopia', 'dsx', 'exmo', 'gatecoin', 'gateio', 'gdax', 'gemini', 'hitbtc2', 'huobipro', 'kucoin', 'lakebtc', 'liqui', 'livecoin', 'mixcoins', 'poloniex', 'qryptos', 'quadrigacx', 'quoine', 
  'southxchange', 'therock', 'tidex', 'wex', 'zaif'
];

// Removed 'cryptopia', 'quadrigacx',
const exchangesWithAccounts = ['gateio', 'huobipro', 'liqui', 'bleutrade', 'binance'];
const heldCurrencies = ['NEO', 'BTC', 'ETH', 'BAT', 'AST', 'RCN', 'GNT', 'REP', 'GNO', 'STORJ', 'BNT', 'MTX', 'BTG', 'KIN', 'LTC', 'DOGE', 'XLM', 'USDT', 'XMR' ];
const isAcceptedCurrencies = (symbol) => heldCurrencies.some(c => symbol.startsWith(`${c}/`)) && heldCurrencies.some(c => symbol.endsWith(`/${c}`));
const isFiatMarket = (symbol) => ['USD', 'CAD', 'EUR', 'NZD', 'SGD', 'RUB', 'RUR', 'AUD', 'GBP', 'HKD', 'JPY' ].some(c => symbol.endsWith(`/${c}`));

async function getExperimentConfiguration(name) {
  const configurations = {
    liqobi: {
      exchangeIds: [ 'liqui', 'huobipro' ],
      holdings: considerableHoldings,
      symbols: [
        'AST/BTC', 'BAT/BTC', 'BAT/ETH', 'BCH/BTC', 'BCH/USDT', 'BTC/USDT', 'CVC/BTC', 'CVC/ETH', 'CVC/USDT', 'DASH/BTC', 'DASH/USDT', 'DGD/BTC', 'DGD/ETH', 'EOS/BTC', 'EOS/ETH', 'EOS/USDT', 'ETH/BTC', 'ETH/USDT', 'GNT/BTC', 'GNT/ETH', 'GNT/USDT', 'KNC/BTC', 
        'LTC/BTC', 'LTC/USDT', 'MANA/BTC', 'MANA/ETH', 'MCO/BTC', 'MCO/ETH', 'OMG/BTC', 'OMG/ETH', 'OMG/USDT', 'PAY/BTC', 'PAY/ETH', 'QTUM/BTC', 'QTUM/ETH', 'QTUM/USDT', 'REQ/BTC', 'REQ/ETH', 'SALT/BTC', 'SALT/ETH', 'SNT/BTC', 'SNT/USDT', 'STORJ/BTC', 'STORJ/USDT', 'TNT/BTC', 'TNT/ETH', 'VEN/BTC', 'VEN/ETH', 'ZRX/BTC'
      ],
      infiniteHoldings: true,
    },
    all: async () => await genericExchangePairExperiment({ exchangeIds : process.argv.length > 2 && process.argv.slice(3) }),
    c2c: async () => await genericExchangePairExperiment({
      exchangeIds: cryptoToCryptoExchanges,
      symbolFilter: s => !isFiatMarket(s),
      display: 'table',
      infiniteHoldings: true,
    }),
    infinite: async () => await genericExchangePairExperiment({
      exchangeIds: exchangesWithAccounts,
      symbolFilter: sym => !isFiatMarket(sym) && isAcceptedCurrencies(sym),
      display: 'table',
      infiniteHoldings: true,
    }),
    deep: {
      exchangeIds: process.argv.length > 3 && process.argv[3].split(','),
      symbols: process.argv.length > 3 && process.argv[4].split(','),
    },
    real: async () => await genericExchangePairExperiment({
      exchangeIds: exchangesWithAccounts,
      symbolFilter: sym => !isFiatMarket(sym) && isAcceptedCurrencies(sym),
      display: 'table',
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
  
  console.log(`Executing experiment with configuration: ${JSON.stringify(config, null, 2)}`);
  return config;
}

module.exports = {
  exchangesWithAccounts,
  getExperimentConfiguration,
  isFiatMarket,
  heldCurrencies,
};
