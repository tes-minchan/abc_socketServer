const config = require('../config');
const Redis  = require('redis');
const redisClient = Redis.createClient(config.redisConfig);


class Quotes {

  /**
   * Creates a Quotes instance.
   *
   */
  constructor () {
    this.redisTable = {
      BTC : [],
      ETH : [],
      EOS : [],
      XRP : [],
      ZRX : [],
      LOOM : []
    }

    this.redisTable.BTC = _getMarketName('BTC');
    this.redisTable.ETH = _getMarketName('ETH');
    this.redisTable.EOS = _getMarketName('EOS');
    this.redisTable.XRP = _getMarketName('XRP');
    this.redisTable.ZRX = _getMarketName('ZRX');
    this.redisTable.LOOM = _getMarketName('LOOM');

  }


  getArbitrage (cb) {

    redisClient.hgetall("arbitrage",(err,result) => {
      let market = Object.keys(result);
      let data = Object.values(result);

      let toSend = {
        market : market,
        data   : data
      }

      cb(toSend);
    });


  }


  getOrderbook (currency, cb) {
    if(!currency) {
      console.log("Need to currency Name !!!");
      return;
    }

    let toSendData = [];
    let orderbook = {};

    redisClient.multi(this.redisTable[currency]).execAsync().then(result => {
      result.map((item, index) => {

        if(!item) {
          return;
        }

        let market = this.redisTable[currency][index][1].split('_')[0];
        let type   = this.redisTable[currency][index][1].split('_')[2];
        let price  = Object.keys(item);
        let volume = Object.values(item);

        if(type === "ASK") {
          orderbook.market = market;

          if(market === 'BITFINEX') {
            price = price.sort((a,b) => a - b);
            orderbook.ASK = {
              price : [price[0],price[1]],
              volume : [result[index][price[0]], result[index][price[1]]]
            }
          }
          else {
            orderbook.ASK = {
              price : [price[0],price[1]],
              volume : [parseFloat(volume[0]).toPrecision(3),parseFloat(volume[1]).toPrecision(3)]
            }
          }
        }
        else {
          let [price_length, volume_length] = [price.length-1,volume.length-1];

          if(market === 'BITFINEX') {
            price = price.sort((a,b) => a - b);

            orderbook.BID = {
              price : [price[price_length],price[price_length-1]],
              volume : [parseFloat(volume[volume_length]).toPrecision(3),parseFloat(volume[volume_length-1]).toPrecision(3)]
            }  
          }
          else {
            orderbook.BID = {
              price : [price[price_length],price[price_length-1]],
              volume : [ result[index][price[price_length]], result[index][price[price_length - 1]] ]
            }   
          }
          toSendData.push(orderbook);
          orderbook = {};
        }
      });
      cb(toSendData);

    });

  }




}


// Get Redis Table Name.
_getMarketName = (counter_currency) => {
  let redisTable = [];

  let quote_currency = 'KRW';
  config.redisTable.krw_market.map(getMarket => {
    redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_ASK`]);
    redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_BID`]);
  });

  quote_currency = 'USD';
  config.redisTable.usd_market.map(getMarket => {
    redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_ASK`]);
    redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_BID`]);
  });

  return redisTable;
}

module.exports = Quotes;

