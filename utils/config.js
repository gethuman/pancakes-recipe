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
        var config = pancakes.cook('config/index');

        // get the API base
        // the following is so tests don't break...
        var useSSL = (config.api && config.api.clientUseSSL !== undefined) ?
            config.api.clientUseSSL : config.useSSL;
        var apiBase = (useSSL ? 'https://' : 'http://') + (config.api ? config.api.host : 'test.dev.gethuman.com');
        var apiPort = (config.api ? config.api.port + '' : '433');

        if (apiPort !== '80' && apiPort !== '433') {
            apiBase += ':' + apiPort;
        }

        apiBase += '/' + (config.api ? config.api.version : 'test');

        // set config values for the client web apps
        var logConfig = config.logging || {};
        var securityConfig = config.security || {};
        var authConfig = securityConfig.auth || {};

        config.webclient = config.webclient || {};
        _.extend(config.webclient, {
            apiBase:                apiBase,
            errorUrl:               logConfig.errorClientUrl,
            logLevel:               logConfig.level,
            logTransport:           logConfig.transport,
            i18nDebug:              config.i18nDebug,
            appEnv:                 config.env,
            version:                config.staticVersion,
            baseHost:               config.baseHost,
            domains:                config.domains,
            cookieDomain:           (securityConfig.cookie ? securityConfig.cookie.domain : 'test.dev.gethuman.com'),
            authDomain:             authConfig.domain,
            authClientId:           authConfig.clientId,
            realtime:               config.realtime
        });

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
