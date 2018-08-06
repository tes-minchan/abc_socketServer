const config = require('../config');
const Redis = require('redis');
const redisClient = Redis.createClient(config.redisConfig);


// Get Redis Table Name.
const _getMarketName = (counter_currency, quote_currency) => {
  let redisTable = [];

  if(quote_currency === 'KRW') {
    config.redisTable.krw_market.map(getMarket => {
      redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_ASK`]);
      redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_BID`]);

    })
  }
  else if(quote_currency === 'USD') {
    config.redisTable.usd_market.map(getMarket => {
      redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_ASK`]);
      redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_BID`]);
    })
  }
   return redisTable;
}


module.exports = {

  /**
   * Get All Market quotes from redis.
   */

  getAllQuotes : async (redisClient) => {
    let redisTable = await _getMarketName();

    return redisClient.multi(redisTable).execAsync().then(result => result);
  },


  getRedisTable : async (counter_currency, quote_currency) => {    
    let redisTable = await _getMarketName(counter_currency, quote_currency);

    return redisTable;
  }




}

