/**
 * Author: Jeff Whelpley
 * Date: 6/15/15
 *
 * This middleware is used to force the client to use SSL if the configuration
 * for the requested app has forceSSL: true in the config file
 */
module.exports = function (Q, config, routeHelper, log) {

    /**
     * Check to see if a given request should be redirected
     * to another URL based on either SSL or redirects in
     * app config.
     *
     * @param req
     * @param reply
     */
    function checkIfSSL(req, reply) {
        var url = req.url.path;
        var appName = req.app.name;
        var lang = req.app.lang;
        var forceSSL = (config[appName] && config[appName].forceSSL !== undefined) ?
            config[appName].forceSSL : config.forceSSL;
        var port = (req.headers && req.headers['x-forwarded-port']) || '';
        var cloudFrontSsl = req.headers['cloudfront-forwarded-proto'] === 'https';
        var host = routeHelper.getBaseUrl(appName, lang);

        if (forceSSL && port === '80' && url !== '/ping' && !cloudFrontSsl) {

            // make sure https (route helper may return http if forceSSL true by useSSL false
            if (host.substring(0, 5) === 'http:') {
                log.error(appName + ' configuration issue. useSSL is false while forceSSL is true');
                host = host.replace('http:', 'https:');
            }

            reply.redirect(host + url).permanent(true);
        }
        else {
            reply.continue();
        }
    }

    /**
     * Add middleware for doing redirects
     */
    function init(ctx) {
        var server = ctx.server;
        server.ext('onRequest', checkIfSSL);
        return new Q(ctx);
    }

    return {
        checkIfSSL: checkIfSSL,
        init: init
    };
};