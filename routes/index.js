const OAuthService = require('../services/oauth');

function startApplication(req, res) {
  OAuthService.initApp(req, res, this.app);
}

function activateCharge(req, res) {
  OAuthService.activateCharge(req, res, this.app);
}

function getAuthToken(req, res) {
  OAuthService.getAuthToken(req, res, this.app);
}

module.exports = (app) => {

  app.get('/', startApplication.bind({ app }));
  app.get('/activate_charge', activateCharge.bind({ app }));
  app.get('/auth_token', getAuthToken.bind({ app }));

};
