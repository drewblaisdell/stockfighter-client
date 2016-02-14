import async from 'async';
import pick from 'lodash/pick';
import request from 'superagent';
const debug = require('debug')('app');

import { API_KEY, BASE_URL, VENUE, STOCK, TRADING_ACCOUNT, TARGET_PRICE, SHARES_PER_PURCHASE } from '../config';

function getOrders(callback) {
  request
    .get(`${BASE_URL}/venues/${VENUE}/accounts/${TRADING_ACCOUNT}/orders`)
    .set('X-Starfighter-Authorization', API_KEY)
    .end((err, res) => {
      if ( err ) {
        return console.log('Error getting orders:', err);
      }

      const response = JSON.parse(res.text);
      debug('Received orders response:', response);
      callback(response.orders);
    });
}

function getOpenOrders(callback) {
  return getOrders(res => {
    return callback(res.filter(n => n.open));
  });
}

function cancelOpenOrders(callback) {
  getOpenOrders( res => {
    const cancelFns = res.map(order => cancelOrder.bind( null, order.id ));
    async.parallel(
      cancelFns,
      (err, res) => {
        console.log(`Canceled ${cancelFns.length} orders`);
        callback();
      }
    );
  });
}

function cancelOrder(id, callback) {
  request
    .delete(`${BASE_URL}/venues/${VENUE}/stocks/${STOCK}/orders/${id}`)
    .set('X-Starfighter-Authorization', API_KEY)
    .end((err, res) => {
      if ( err ) {
        return console.log('Error getting orderbook:', err);
      }

      console.log(`Canceled order id ${id}`);

      const response = JSON.parse(res.text);
      debug('Received response when canceling order:', res);

      callback(response);
    });
}

function getOrderbook(callback) {
  request
    .get(`${BASE_URL}/venues/${VENUE}/stocks/${STOCK}`)
    .set('X-Starfighter-Authorization', API_KEY)
    .end((err, res) => {
      if ( err ) {
        return console.log('Error getting orderbook:', err);
      }

      const response = JSON.parse(res.text);
      debug('Received orderbook response:', response);
      callback(response);
    });
}

function getQuote(callback) {
  request
    .get(`${BASE_URL}/venues/${VENUE}/stocks/${STOCK}/quote`)
    .set('X-Starfighter-Authorization', API_KEY)
    .end((err, res) => {
      if ( err ) {
        return console.log('Error getting quote:', err);
      }

      const response = JSON.parse(res.text);
      debug('Received quote:', response);
      callback(response);
    });
}

function getSpread(callback) {
  getQuote( res => {
    const spread = pick(res, ['bid', 'ask']);
    debug( 'Retrieved spread:', spread);

    callback(spread);
  });
}

function makeLimitOrder(price, qty, direction, callback) {
  const order = {
    account: TRADING_ACCOUNT,
    venue: VENUE,
    symbol: STOCK,
    price,
    qty,
    direction,
    orderType: 'limit'
  };

  request
    .post(`${BASE_URL}/venues/${VENUE}/stocks/${STOCK}/orders`)
    .send(order)
    .set('X-Starfighter-Authorization', API_KEY)
    .end((err, res) => {
      if ( err ) {
        return console.log('Error making limit order:', err);
      }

      console.log(`Made limit order to ${direction} ${qty} shares at ${price}`);

      const response = JSON.parse(res.text);
      debug('Received response from limit order:', response);
      callback(response);
    });
}

function makeAskLimitOrder(callback) {
  getQuote(res => {
    makeLimitOrder(res.ask, SHARES_PER_PURCHASE, 'buy', res => {
      callback(res);
    });
  });
}

function makeAskLimitOrderRepeatedly() {
  makeAskLimitOrder( () => {
    makeAskLimitOrderRepeatedly();
  })
}

function makeLastLimitOrder(callback) {
  getQuote(res => {
    makeLimitOrder(res.last, SHARES_PER_PURCHASE, 'buy', res => {
      callback(res);
    });
  });
}

function makeLastLimitOrderRepeatedly() {
  makeLastLimitOrder( () => {
    makeLastLimitOrderRepeatedly();
  })
}

export default {
  getOrders,
  getOpenOrders,
  cancelOpenOrders,
  cancelOrder,
  getOrderbook,
  getQuote,
  getSpread,
  makeLimitOrder,
  makeAskLimitOrder,
  makeLastLimitOrderRepeatedly,
  makeAskLimitOrderRepeatedly
};
