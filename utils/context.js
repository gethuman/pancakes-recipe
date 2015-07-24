/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 5/1/14
 *
 * Context on server comes from CLS and from the client comes from client data
 */
module.exports = {

    /**
     * Context on the client side comes from the clientData
     * @param clientData
     * @returns {*}
     */
    client: function (clientData) {
        var context = clientData.get('context') || {};
        return {
            get: function (key) {
                return context[key];
            }
        };
    },

    /**
     * Context on the server side comes from CLS
     */
    server: function (cls) {
        return {
            get: function (key) {
                var ns = cls.getNamespace('appSession');
                return ns && ns.active && ns.get(key);
            }
        };
    }
};
