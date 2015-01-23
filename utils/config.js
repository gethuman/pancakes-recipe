/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 4/23/14
 *
 * Config for the client and server
 */
module.exports = {

    /**
     * On the server, config comes from the config dir
     */
    server: function (pancakes) {
        return pancakes.cook('config/index');
    },

    /**
     * Client version of the config file comes from data in the DOM
     * @param clientData
     * @returns {{}}
     */
    client: function (clientData) {
        return clientData.get('config') || {};
    }
};
