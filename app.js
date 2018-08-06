const config = require('./config');
const Redis = require('redis');
const bluebird = require('bluebird');
const redisClient = Redis.createClient(config.redisConfig);
const redisController = require('./lib/redisTable');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3600 });

// Get Market List from config file.
const MarketList = config.redisTable.market;

// enviroments setting.
bluebird.promisifyAll(Redis);
process.on('uncaughtException', function (err) {
  console.log("Node NOT Exiting...");
});

// Listening to Web connection.
wss.on('connection', function connection(ws) {
  console.log("new connection");

  ws.on('close', function close() {
    console.log('disconnected');
  });

  ws.on('message', function incoming(data) {
    // Control incoming message.
    console.log("incoming message: "+data);
  });

  // Send market quotes.
  setInterval(function(){
    if(ws.readyState === 1) {

      redisController.getAllQuotes(redisClient)
        .then(result => {
          let toSendData = [];
          let orderbook = {};
          let checkIndex = 0;
          let market;
    
          result.map((quotes, index) => {
            checkIndex++;

            let price  = Object.keys(quotes);
            let volume = Object.values(quotes);
    
            // Market check.
            if(checkIndex == 1) {
              market = MarketList[index/2];
              orderbook.market = market;
    
            }
            else if(checkIndex == 2) {
              checkIndex = 0;
            }

            // Bitfinex price
            if(market === "BITFINEX") {
              price = price.sort((a,b) => a - b);
            }
    
            // Save Market ASK/BID
            if(index%2 == 0) {
              // ASK
              if(market !== "BITFINEX") {
                orderbook.ASK = {
                  price : [price[0],price[1]],
                  volume : [parseFloat(volume[0]).toPrecision(3),parseFloat(volume[1]).toPrecision(3)]
                }
              }
              else {
                orderbook.ASK = {
                  price : [price[0],price[1]],
                  volume : [result[index][price[0]], result[index][price[1]]]
                }
              }
              
            }
            else {
              // BID
              let [price_length, volume_length] = [price.length-1,volume.length-1];
              if(market !== "BITFINEX") {
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
    
          ws.send(JSON.stringify(toSendData));
      });
    }
  },1000);
  
});

