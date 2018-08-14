
const config = require('../config');
const Redis  = require('redis');
const sleep  = require('sleep');
const async  = require('async');

const redisClient = Redis.createClient(config.redisConfig);
const _ = require('underscore');


const _getMinAsk = function(marketInfos, values, cb) {
  let toBuyMarket = {
    market : "",
    minAsk : 0,
    volume : 0
  };

  let index = 0;

  async.map(values, 
    function(item, callback) {
      if(!item) {
        callback(null);
      }
      else {
        let market = marketInfos.askMarketList[index][1].split('_')[0];
        let price  = Object.keys(item);
        let volume = Object.values(item);
  
        if(index < 1) {
          toBuyMarket.market = market;
          toBuyMarket.minAsk = price[0];
          toBuyMarket.volume = volume[0];
        }
        else {
          if( Number(price[0]) < Number(toBuyMarket.minAsk) ) {
            toBuyMarket.market = market;
            toBuyMarket.minAsk = price[0];
            toBuyMarket.volume = volume[0];
          }
        }
  
        index++;
  
        callback(null);
      }
      
    },
    (error, result) => {
      cb(null, toBuyMarket);
    });
}

const _getMaxBid = function(marketInfos, values, cb) {

  let toSellMarket = {
    market : null,
    maxBid : 0,
    volume : 0
  };

  let index = 0;

  async.map(values, 
    function(item, callback) {
      if(!item) {
        callback(null);
      }
      else {
        let market = marketInfos.bidMarketList[index][1].split('_')[0];
        let price  = Object.keys(item);
        let volume = Object.values(item);
        let [price_length, volume_length] = [price.length-1,volume.length-1];
  
        if(index < 1) {
          toSellMarket.market = market;
          toSellMarket.maxBid = price[price_length];
          toSellMarket.volume = volume[volume_length];
        }
        else {
          if( Number(price[price_length]) > Number(toSellMarket.maxBid) ) {
            toSellMarket.market = market;
            toSellMarket.maxBid = price[price_length];
            toSellMarket.volume = volume[volume_length];;
          }
        }
  
        index++;
  
        callback(null);
      }
      
    },
    (error, result) => {
      cb(null, toSellMarket);
    });
}

const _getArbitrage = function(marketInfos, cb) {


  let toSend = {};

  redisClient.multi(marketInfos.askMarketList).exec((error, values) => {

    _getMinAsk(marketInfos, values, (error, result) => {

      toSend.buy = result;

    });


    redisClient.multi(marketInfos.bidMarketList).exec((error, values) => {

      _getMaxBid(marketInfos, values, (error, result) => {

        toSend.sell = result;
  
      });
      cb(null, toSend);

    });


  });




}


module.exports = {

  _getMarketRedisTable : function(get_data, callback) {
    let marketRedisList = [];
    let parseJson = JSON.parse(get_data);
  
    _.map(parseJson, (values, coin) => {
    let coinInfo = {
      coin : coin
    }
    
    let getAskRedisTable = [];
    let getBidRedisTable = [];
  
    // set ask market list (first value compare)
    values.askmarket.map(askmarket => {
      getAskRedisTable.push(["hgetall", `${askmarket}_${coin}KRW_ASK`]);
    });
    coinInfo.askMarketList = getAskRedisTable;
  
    // set bid market list 
    values.bidmarket.map(bidmarket => {
      getBidRedisTable.push(["hgetall", `${bidmarket}_${coin}KRW_BID`]);
    });
  
    coinInfo.bidMarketList = getBidRedisTable;
  
    marketRedisList.push(coinInfo);
  
    });
  
  
    callback(null, marketRedisList);
  },
    
  _calculateArbitrage : function(marketPrices, callback) {

    let toSendData = {
      market : [],
      data   : []
    };

    marketPrices.map(item => {
      toSendData.market.push(item.coin);
    });

    async.map(marketPrices, _getArbitrage, (error, result) => {
      result.map(item => {
        toSendData.data.push(item);

      });

      callback(null, toSendData);      
    });

  }
}