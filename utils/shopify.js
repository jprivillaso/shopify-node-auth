const MY_SHOPIFY_PREFIX = '.myshopify.com';

function removeShopifyPrefix(shopName) {
  return shopName.replace(MY_SHOPIFY_PREFIX, '');
}

module.exports = {
  removeShopifyPrefix
};
