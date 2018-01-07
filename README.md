# Shopify App Authentication with Nodejs
This is a boilerplate to be used if you want to create an embedded application for Shopify.

# Project structure

This project includes a NodeJs server that will deliver static files at a specified port.
When creating embedded applications at Shopify you need to create an Oauth flux in order to authenticate and isntall the app in a Shopify Store.

`app.js` will contain the server configuration and will serve static files from the `public` folder.

Pay special attention to the config folder as it will contain all the information needed to authenticate at Shopify.

OAuth data is contained at `auth.development` and `auth.production`. Two files exist because some of these properties can be different for specified environmens.

# Deploy

There are so many tools that can be used for deploying small apps, however if you want to deploy an application in a matter of minutes, [wedeploy](https://wedeploy.com/) can be a good choice.

Additional configuration will be nedded from the Shopify Partners account, under Apps menu.

# Testing the App
After deploying your application in your server, you should call this URL at your browser

`https://your-server-domain.com?shop=your-shop-name.myshopify.com`

This will simulate a real installation from the Shopify Store link when the user clicks at the install button.
