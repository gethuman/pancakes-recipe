/**
 * Copyright 2014 GetHuman LLC
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
    server: function (pancakes) {
        var config = pancakes.cook('config/index');

        // get the API base
        var useSSL = (config.api && config.api.clientUseSSL !== undefined) ?
            config.api.clientUseSSL : config.useSSL;
        var apiBase = (useSSL ? 'https://' : 'http://') + config.api.host;
        var apiPort = config.api.port + '';

        if (apiPort !== '80' && apiPort !== '433') {
            apiBase += ':' + apiPort;
        }

        apiBase += '/' + config.api.version;

        // set config values for the client web apps
        config.client = {
            apiBase:                apiBase,
            i18nDebug:              config.i18nDebug,
            logToken:               config.logging.logglyToken,
            appEnv:                 config.env,
            version:                config.staticVersion,
            baseHost:               config.baseHost,
            domains:                config.domains,
            cookieDomain:           config.security.cookie.domain
        };

        return config;
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
