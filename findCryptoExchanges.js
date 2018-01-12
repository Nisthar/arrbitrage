const ccxt = require('ccxt');


/* Failed list of exchanges: 
_1broker, braziliex, bter, flowbtc, kraken, xbtce, yunbi, 'yobit',
*/

const exchangeIds = [ '_1btcxe', 'acx', 'allcoin', 'anxpro', 'binance', 'bit2c', 'bitbay', 'bitcoincoid', 'bitfinex', 'bitfinex2', 'bitflyer', 'bithumb', 'bitlish', 'bitmarket', 'bitmex', 'bitso', 'bitstamp', 'bitstamp1', 'bittrex', 'bl3p', 'bleutrade', 'btcbox', 'btcchina', 'btcexchange', 'btcmarkets', 'btctradeua', 'btcturk', 'btcx', 'bxinth', 'ccex', 'cex', 'chbtc', 'chilebit', 'coincheck', 'coinfloor', 'coingi', 'coinmarketcap', 'coinmate', 'coinsecure', 'coinspot', 'cryptopia', 'dsx', 'exmo', 'foxbit', 'fybse', 'fybsg', 'gatecoin', 'gateio', 'gdax', 'gemini', 'getbtc', 'hitbtc', 'hitbtc2', 'huobi', 'huobicny', 'huobipro', 'independentreserve', 'itbit', 'jubi', 'kucoin', 'kuna', 'lakebtc', 'liqui', 'livecoin', 'luno', 'lykke', 'mercado', 'mixcoins', 'nova', 'okcoincny', 'okcoinusd', 'okex', 'paymium', 'poloniex', 'qryptos', 'quadrigacx', 'quoine', 'southxchange', 'surbitcoin', 'therock', 'tidex', 'urdubit', 'vaultoro', 'vbtc', 'virwox', 'wex',  'zaif', 'zb' ];

(async function main() {
  const exchanges = {};
  const markets = {};
  for (let id of exchangeIds) {
    console.log(`Loading exchange ${id}`);
    exchanges[id] = new ccxt[id]();
    markets[id] = Object.keys(await exchanges[id].loadMarkets());
  }

  const cryptoExchanges = exchangeIds.filter(id => markets[id] && markets[id].includes('ETH/BTC'));
  console.log(cryptoExchanges);
})();
