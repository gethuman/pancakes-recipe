/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 5/1/14
 *
 * This file contains all translations for all apps. On the client side the
 * translations are pulled from the DOM.
 */
module.exports = {

    server: function () {
        return {};
    },

    client: function (clientData) {
        return clientData.translations || {};
    }
};
