const config = require('../config');
const Redis  = require('redis');
const async  = require('async');
const arbitrageAPI = require('./arbitrage');

const redisClient = Redis.createClient(config.redisConfig);

module.exports = {

  getArbitrage : function(subscribe_coin, callback) {

    // redisClient.hgetall("arbitrage",(err,result) => {
    //   let market = Object.keys(result);
    //   let data   = Object.values(result);

    //   let toSend = {
    //     market : market,
    //     data   : data
    //   }
    //   // console.log(JSON.stringify(toSend));
    //   // console.log("=========================")
    //   callback(toSend);
    // });


    async.waterfall([
      async.apply(arbitrageAPI._getMarketRedisTable, subscribe_coin),
      async.apply(arbitrageAPI._calculateArbitrage),
  
    ], function(error, result){
      callback(result);
  
    });
  
  }

}


// Quotes.prototype._getMinAsk = function(askRedisTable, callback) {
  
//   console.log(this);
//   let toBuyMarket = {
//     market : null,
//     minAsk : 0,
//     volume : 0
//   };

//   this.redisClient.multi(askRedisTable).execAsync().then(result => {
//     result.map((values,index) => {
//       let market = askRedisTable[index][1].split('_')[0];
//       let price  = Object.keys(values);
//       let volume = Object.values(values);

//       if(index < 1) {
//         toBuyMarket.market = market;
//         toBuyMarket.minAsk = price[0];
//         toBuyMarket.volume = volume[0];
//       }
//       else {
//         if( Number(price[0]) < Number(toBuyMarket.minAsk) ) {
//           toBuyMarket.market = market;
//           toBuyMarket.minAsk = price[0];
//           toBuyMarket.volume = volume[0];
//         }
//       }
//     });

//     callback(toBuyMarket);
//   });

// }




// class Quotes {

//   /**
//    * Creates a Quotes instance.
//    *
//    */
//   constructor () {
//     this.redisTable = {
//       BTC : [],
//       ETH : [],
//       EOS : [],
//       XRP : [],
//       ZRX : [],
//       LOOM : []
//     }

//     this.redisTable.BTC  = _getMarketName('BTC');
//     this.redisTable.ETH  = _getMarketName('ETH');
//     this.redisTable.EOS  = _getMarketName('EOS');
//     this.redisTable.XRP  = _getMarketName('XRP');
//     this.redisTable.ZRX  = _getMarketName('ZRX');
//     this.redisTable.LOOM = _getMarketName('LOOM');

//   }

//   checkMinAsk (askRedisTable) {
  
//     let toBuyMarket = {
//       market : null,
//       minAsk : 0,
//       volume : 0
//     };

//     redisClient.multi(askRedisTable).execAsync().then(result => {
//       result.map((values,index) => {
//         let market = askRedisTable[index][1].split('_')[0];
//         let price  = Object.keys(values);
//         let volume = Object.values(values);

//         if(index < 1) {
//           toBuyMarket.market = market;
//           toBuyMarket.minAsk = price[0];
//           toBuyMarket.volume = volume[0];
//         }
//         else {
//           if( Number(price[0]) < Number(toBuyMarket.minAsk) ) {
//             toBuyMarket.market = market;
//             toBuyMarket.minAsk = price[0];
//             toBuyMarket.volume = volume[0];
//           }
//         }
//       });
//       return toBuyMarket;
//     });



//   }
  
//   checkMaxBid (bidRedisTable, toSendResult, cb) {
//     let toSellMarket = {
//       market : null,
//       maxBid : 0,
//       volume : 0
//     };

//     redisClient.multi(bidRedisTable).execAsync().then(result => {
//       result.map((values,index) => {
//         let [price_length, volume_length] = [price.length-1,volume.length-1];

//         let market = bidRedisTable[index][1].split('_')[0];
//         let price  = Object.keys(values);
//         let volume = Object.values(values);

//         if(index < 1) {
//           toSellMarket.market = market;
//           toSellMarket.maxBid = price[price_length];
//           toSellMarket.volume = volume[volume_length];
//         }
//         else {
//           if( Number(price[price_length]) > Number(toSellMarket.maxBid) ) {
//             toSellMarket.market = market;
//             toSellMarket.minAsk = price[0];
//             toSellMarket.volume = volume[0];
//           }
//         }
//       });
//       toSendResult.sell = toSellMarket;
//       cb();
//     });
//   }



//   getMarketRedisTable (paramater, cb) {
//     let marketRedisList = [];

//     _.map(paramater, (values, coin) => {
//       let coinInfo = {
//         coin : coin
//       }
//       let getAskRedisTable = [];
//       let getBidRedisTable = [];

//       // set ask market list (first value compare)
//       values.askmarket.map(askmarket => {
//         getAskRedisTable.push(["hgetall", `${askmarket}_${coin}KRW_ASK`]);
//       });
//       coinInfo.askMarketList = getAskRedisTable;

//       // set bid market list 
//       values.bidmarket.map(bidmarket => {
//         getBidRedisTable.push(["hgetall", `${bidmarket}_${coin}KRW_BID`]);
//       });
//       coinInfo.bidMarketList = getBidRedisTable;

//       marketRedisList.push(coinInfo);

//     });

//     cb(marketRedisList);

//   }

//   getArbitrage (subscribe_coin,  cb) {
//     let parseJson = JSON.parse(subscribe_coin);

//     async.waterfall([
//       async.apply(this.getMarketRedisTable, parseJson),
//       async.apply(getArbitrageInfo),

      
//     ], function(result) {
//       // console.log(result);

//     });
    
//     // this.getMarketRedisTable((parseJson, result) => {

//     //   result.asyncForEach(item => {
//     //     console.log(item);
//     //   })

//     //   Promise.all(result.map(async (item) => {
//     //     console.log(item);
//     //   }));

//     //   console.log("FINISH");

//     // //   result.map((item) => {

//     // //     let toBuyMarket = {
//     // //       market : null,
//     // //       minAsk : 0,
//     // //       volume : 0
//     // //     };
    
//     // //     redisClient.multi(item.askMarketList).execAsync().then(result => {
//     // //       result.map((values,index) => {
//     // //         let market = item.askMarketList[index][1].split('_')[0];
//     // //         let price  = Object.keys(values);
//     // //         let volume = Object.values(values);
    
//     // //         if(index < 1) {
//     // //           toBuyMarket.market = market;
//     // //           toBuyMarket.minAsk = price[0];
//     // //           toBuyMarket.volume = volume[0];
//     // //         }
//     // //         else {
//     // //           if( Number(price[0]) < Number(toBuyMarket.minAsk) ) {
//     // //             toBuyMarket.market = market;
//     // //             toBuyMarket.minAsk = price[0];
//     // //             toBuyMarket.volume = volume[0];
//     // //           }
//     // //         }
//     // //       });
//     // //       console.log(toBuyMarket);
//     // //     });
//     // //     console.log("FINISH2");


//     // //   });

//     // //   console.log("FINISH");
//     // });



      



//   }


//   getOrderbook (currency, cb) {
//     if(!currency) {
//       console.log("Need to currency Name !!!");
//       return;
//     }

//     let toSendData = [];
//     let orderbook = {};

//     redisClient.multi(this.redisTable[currency]).execAsync().then(result => {
//       result.map((item, index) => {

//         if(!item) {
//           return;
//         }

//         let market = this.redisTable[currency][index][1].split('_')[0];
//         let type   = this.redisTable[currency][index][1].split('_')[2];
//         let price  = Object.keys(item);
//         let volume = Object.values(item);

//         if(type === "ASK") {
//           orderbook.market = market;

//           if(market === 'BITFINEX') {
//             price = price.sort((a,b) => a - b);
//             orderbook.ASK = {
//               price : [price[0],price[1]],
//               volume : [result[index][price[0]], result[index][price[1]]]
//             }
//           }
//           else {
//             orderbook.ASK = {
//               price : [price[0],price[1]],
//               volume : [parseFloat(volume[0]).toPrecision(3),parseFloat(volume[1]).toPrecision(3)]
//             }
//           }
//         }
//         else {
//           let [price_length, volume_length] = [price.length-1,volume.length-1];

//           if(market === 'BITFINEX') {
//             price = price.sort((a,b) => a - b);

//             orderbook.BID = {
//               price : [price[price_length],price[price_length-1]],
//               volume : [parseFloat(volume[volume_length]).toPrecision(3),parseFloat(volume[volume_length-1]).toPrecision(3)]
//             }  
//           }
//           else {
//             orderbook.BID = {
//               price : [price[price_length],price[price_length-1]],
//               volume : [ result[index][price[price_length]], result[index][price[price_length - 1]] ]
//             }   
//           }
//           toSendData.push(orderbook);
//           orderbook = {};
//         }
//       });
//       cb(toSendData);

//     });

//   }

// }

// getArbitrageInfo = (marketInfo, cb) =>  {
//   console.log(marketInfo);

//   cb("FINISH");
// }


// // Get Redis Table Name.
// _getMarketName = (counter_currency) => {
//   let redisTable = [];

//   let quote_currency = 'KRW';
//   config.redisTable.krw_market.map(getMarket => {
//     redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_ASK`]);
//     redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_BID`]);
//   });

//   quote_currency = 'USD';
//   config.redisTable.usd_market.map(getMarket => {
//     redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_ASK`]);
//     redisTable.push(["hgetall", `${getMarket}_${counter_currency}${quote_currency}_BID`]);
//   });

//   return redisTable;
// }

