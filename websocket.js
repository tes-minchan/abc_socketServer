const config = require('./config');
const Redis = require('redis');
const bluebird = require('bluebird');
const redisClient = Redis.createClient(config.redisConfig);
const redisController = require('./lib/redisTable');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3600 });
let Quotes = require('./lib/quotes');

// Get Market List from config file.
const MarketList = config.redisTable.market;

let table = [];

// enviroments setting.
bluebird.promisifyAll(Redis);
process.on('uncaughtException', function (err) {
  // console.error(err.stack);
  console.log("Node NOT Exiting...");
});

let quotes = new Quotes();

// quotes.getOrderbook('BTC');

// Listening to Web connection.
wss.on('connection', function connection(ws) {
  console.log("new connection");

  ws.on('close', function close() {
    console.log('disconnected');
  });

  ws.on('message', function incoming(data) {
    // Control incoming subscribe message, 
    ws.subscribe = data;
  });

  // Send market quotes.
  setInterval(function() {
    if(ws.readyState === 1) {
      let parseJson = JSON.parse(ws.subscribe);

      if(parseJson.channel === "Arbitrage") {
        quotes.getArbitrage(result => {
          ws.send(JSON.stringify(result));
        });

      }
      else if(parseJson.channel === "Orderbook") {
        quotes.getOrderbook(parseJson.currency, (result) => {
          ws.send(JSON.stringify(result));
        });
      }
    }

  },1000);
  
});

