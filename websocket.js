const config = require('./config');
const Redis = require('redis');
const bluebird = require('bluebird');
const redisClient = Redis.createClient(config.redisConfig);
const redisController = require('./lib/redisTable');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3600 });
const Quotes = require('./lib/quotes');

// Get Market List from config file.
const MarketList = config.redisTable.market;

let table = [];

// enviroments setting.
bluebird.promisifyAll(Redis);
process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});



// Listening to Web connection.
wss.on('connection', function connection(ws) {
  console.log("new connection");

  ws.on('close', function close() {
    console.log('disconnected');
  });

  ws.on('message', function incoming(data) {
    // Control incoming subscribe message, 
    let parseJson = JSON.parse(data);
    
    ws.subscribe = parseJson.channel;
    ws.sub_coin  = parseJson.sub_coin;

  });

  // Send market quotes.
  setInterval(function() {
    if(ws.readyState === 1) {

      if(ws.subscribe === "Arbitrage") {
        Quotes.getArbitrage(ws.sub_coin, result => {
          ws.send(JSON.stringify(result));
        });

      }
    }

  },400);
  
});

