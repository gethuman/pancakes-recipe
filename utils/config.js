/**
 * Author: Jeff Whelpley
 * Date: 4/23/14
 *
 * Config for the client and server
 */
module.exports = {

    /**
     * On the server, config comes from the config dir. We interpret values
     * for the client from the server values (see mw.view.model where the client
     * values are stuck into the DOM)
     */
    server: function (_, pancakes) {
        return pancakes.cook('config/index');
    },

    /**
     * Client version of the config file comes from data in the DOM.
     * See mw.view.model where values are put into the DOM.
     *
     * @param clientData
     * @returns {{}}
     */
    client: function (clientData) {
        return clientData.get('config') || {};
    }
};
