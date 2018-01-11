
const considerableHoldingsHandler = {
  get: (target, name) => target.hasOwnProperty(name) ? target[name] : [ 10000000, 10000000 ]
};
const considerableHoldings = new Proxy({}, considerableHoldingsHandler);

const configurations = {
  liqobi: {
    exchangeIds: [ 'liqui', 'huobipro' ],
    holdings: considerableHoldings,
    symbols: [
      'AST/BTC', 'BAT/BTC', 'BAT/ETH', 'BCH/BTC', 'BCH/USDT', 'BTC/USDT', 'CVC/BTC', 'CVC/ETH', 'CVC/USDT', 'DASH/BTC', 'DASH/USDT', 'DGD/BTC', 'DGD/ETH', 'EOS/BTC', 'EOS/ETH', 'EOS/USDT', 'ETH/BTC', 'ETH/USDT', 'GNT/BTC', 'GNT/ETH', 'GNT/USDT', 'KNC/BTC', 
      'LTC/BTC', 'LTC/USDT', 'MANA/BTC', 'MANA/ETH', 'MCO/BTC', 'MCO/ETH', 'OMG/BTC', 'OMG/ETH', 'OMG/USDT', 'PAY/BTC', 'PAY/ETH', 'QTUM/BTC', 'QTUM/ETH', 'QTUM/USDT', 'REQ/BTC', 'REQ/ETH', 'SALT/BTC', 'SALT/ETH', 'SNT/BTC', 'SNT/USDT', 'STORJ/BTC', 'STORJ/USDT', 'TNT/BTC', 'TNT/ETH', 'VEN/BTC', 'VEN/ETH', 'ZRX/BTC'
    ],
  },
};

module.exports = (name) => {
  const config = configurations[name];
  if (typeof config === 'function') {
    return config();
  }
  
  return config;
};
