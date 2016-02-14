import async from 'async';
import { getSpread, makeLimitOrder, getOpenOrders, cancelOpenOrders, getOrderbook } from './lib/functions';
import { API_KEY, BASE_URL, SPREAD_BUFFER } from './config';

const TIMEOUT = 1000;

function makeOrdersFromSpread(buffer, qty, callback) {
  getOpenOrders(res => {
    if (res.length === 2) {
      console.log(`I have ${res.length} open order(s), trying again.`);
      return cancelOpenOrders( () => {
        return setTimeout(() => makeOrdersFromSpread(buffer, qty, callback), TIMEOUT);
      });
    }

    getSpread(spread => {
      if (! spread.ask || ! spread.bid) {
        console.log('No orders were made because there was no ask or bid');
        return setTimeout(() => makeOrdersFromSpread(buffer, qty, callback), TIMEOUT);
      }

      async.parallel([
        makeLimitOrder.bind(null, spread.ask - buffer, qty, 'sell'),
        makeLimitOrder.bind(null, spread.bid + buffer, qty, 'buy')
      ], (err, res) => {
        console.log('Orders for the spread have been created.');
        return setTimeout(() => makeOrdersFromSpread(buffer, qty, callback), TIMEOUT);
      });
    });
  });
}

makeOrdersFromSpread(50, 100);

// getOpenOrders(console.log);

// setInterval(getOrderbook.bind(null, console.log), 1000);