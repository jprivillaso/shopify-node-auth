const Shopify = require('shopify-api-node');
const ShopifyToken = require('shopify-token');
const ShopifyUtils = require('../utils/shopify');

const config = require('../config.js');

const ACCEPTED_CHARGE_STATUS = 'accepted';
const getCPBMainPage = shop => `https://${shop}.myshopify.com/admin/apps`;

/** INIT APPLICATION */
const authorize = (shopifyToken, req, res, app) => {

  if (req.query && req.query.id !== undefined) {

    res.render('app', {
      title: 'My test product',
      productId: req.query.id,
      apiKey: app.nconf.get('oauth:apiKey'),
      shopUrl: 'https://' + req.query.shop,
      shopName: shopifyToken.shop
    });

  } else {
    res.render('app_fallback');
  }

};

const authenticate = (shopifyToken, req, res) => {

  // Generate authentication URL
  const nonce = shopifyToken.generateNonce();
  const uri = shopifyToken.generateAuthUrl(shopifyToken.shop, undefined, nonce);

  // After redirecting to this URI it will call the method createApplicationCharge
  console.log('Redirecting to ' + uri);
  res.redirect(uri);

};

const initApp = (req, res, app) => {

  const queryLength = Object.keys(req.query).length;

  if (queryLength === 0) {
    res.render('app_fallback');
    return;
  }

  const shopifyToken = new ShopifyToken(app.nconf.get('oauth'));
  shopifyToken.shop = ShopifyUtils.removeShopifyPrefix(req.query.shop);

  // Authorized logic in Admin Mode
  if (req.query && req.query.id && req.query.isAdmin === 1) {

    console.log('Admin mode');
    authorize(shopifyToken, req, res, app);

  } else {

    // Install mode
    if (req.query.isAdmin === undefined && req.query.shop !== undefined && queryLength < 4) {

      console.log('Install mode');
      authenticate(shopifyToken, req, res);

    } else {

      // This is when the user access from the storefront User Mode
      console.log('User Mode');
      res.render('app_fallback', {
        title: '',
        productId: req.query.id,
        apiKey: app.nconf.get('oauth:apiKey'),
        shopUrl: 'https://' + req.query.shop,
        shopName: shopifyToken.shop
      });

    }

  }

};

/** ACTIVATE CHARGE **/
const activateCharge = (req, res) => {

  // eslint-disable-next-line
  const { charge_id, token } = req.query;
  const shop = ShopifyUtils.removeShopifyPrefix(req.query.shop);

  const shopify = new Shopify({
    shopName: shop,
    accessToken: token,
    autoLimit: true
  });

  shopify.recurringApplicationCharge.get(charge_id).then((pendingCharge) => {

    if (pendingCharge && pendingCharge.status === ACCEPTED_CHARGE_STATUS) {

      shopify.recurringApplicationCharge.activate(charge_id, pendingCharge).then((chargeResponse) => {

        console.log('Recurring charge activated successfully', chargeResponse);
        res.redirect(getCPBMainPage(shop));

      }).catch(err => {
        console.error('Error activating charge id', err.response.body);
      });

    } else {
      res.redirect(getCPBMainPage(shop));
    }

  }).catch((err) => {
    console.error('Error getting charge id', err.response.body);
  });

};

/** ACTIVATE TOKEN **/
const createApplicationCharge = (shopName, token, res) => {

  const shopify = new Shopify({
    shopName: ShopifyUtils.removeShopifyPrefix(shopName),
    accessToken: token,
    autoLimit: true
  });

  const params = {
    name: 'Normal Plan',
    price: '20.0',
    return_url: `https://${config.server.url}/activate_charge?shop=${shopName}&token=${token}`,
    trial_days: '10',
    capped_amount: '20.0',
    terms: 'Monthly payments of $US 20.0',
    // Set test=true for development environments
    test: 'true'
  };

  shopify.recurringApplicationCharge.create(params).then((createdCharge) => {

    console.log('Created successfully the recurring application charge and will redirect to ', createdCharge.confirmation_url);
    res.redirect(createdCharge.confirmation_url);

  }).catch((err) => {
    console.log('Error at callack of creating charge', err.response.body);
  });

};

const getAuthToken = (req, res) => {

  const { app } = this;
  const shopifyToken = new ShopifyToken(app.nconf.get('oauth'));

  if (shopifyToken.verifyHmac(req.query)) {

    // Get permanent access token that will be used in the future to make API calls
    shopifyToken.getAccessToken(req.query.shop, req.query.code).then((token) => {

      console.log(`Generated token ${token} for shop ${req.query.shop}`);
      createApplicationCharge(req.query.shop, token, res);

    }).catch((err) => {
      console.error(err.stack);
      res.status(500).send('Oops, something went wrong');
    });

  } else {
    res.status(500).send('Error validating hmac');
    console.error('Error validating hmac');
  }

};

module.exports = {
  initApp,
  activateCharge,
  getAuthToken
};
