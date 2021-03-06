/**
 * Author: Jeff Whelpley
 * Date: 4/5/14
 *
 * This middleware is in charge of setting context variables for a web app
 */
module.exports = function (Q, _, appConfigs, config, cls, translations, routeHelper, AppError) {
    var langSubdomains = config.lang.secondary || [];

    /**
     * Set the language depending on a couple different potential sources
     * @param req
     */
    function setLanguage(req) {
        var host = req.info.host;

        // hack fix for m.reviews, m.fr, m.es, etc.
        if (host.substring(0, 2) === 'm.') {
            req.app.isLegacyMobile = true;
            host = host.substring(2);
        }

        var subdomain = host.substring(0, 2);

        // either at language-based subdomain or we use english
        req.app.lang = (host.charAt(2) === '.' && langSubdomains.indexOf(subdomain) >= 0) ?
            subdomain : 'en';
    }

    /**
     * Set the app domain and name
     * @param req
     * @param domainMap Key is subdomain value, value is the name of the app
     */
    function setAppInfo(req, domainMap) {
        var host = req.info.hostname;
        var domain;

        // hack fix for m.reviews, m.fr, m.es, etc.
        if (host.substring(0, 2) === 'm.') {
            req.app.isLegacyMobile = true;
            host = host.substring(2);
        }

        // if the host starts with the lang, then remove it
        if (host.indexOf(req.app.lang + '.') === 0) {
            host = host.substring(3);
        }

        // if the host name equals the base host then we are dealing with the default domain (ex. gethuman.com)
        if (host === config.baseHost) {
            domain = '';
        }
        // else we need to extract the domain from the host
        else {
            var dotIdx = host.indexOf('.');
            var dashIdx = host.indexOf('-');
            var idx = (dashIdx > 0 && dashIdx < dotIdx) ? dashIdx : dotIdx;
            domain = host.substring(0, idx);
        }

        // get the app name
        var appName = domainMap[domain];

        // if no app name found, try to use the default (else if no default, throw error)
        if (!appName) {
            if (config.webserver && config.webserver.defaultApp) {
                appName = config.webserver.defaultApp;
            }
            else {
                throw AppError.invalidRequestError('No valid domain in requested host: ' + req.info.host);
            }
        }

        // at this point we should have the domain and the app name so set it in the request
        req.app.domain = domain;
        req.app.name = appName;
    }

    /**
     * Set the context into CLS for later usage
     * @param req
     */
    function setContext(req) {
        var session = cls.getNamespace('appSession');
        var appName = req.app.name;

        if (session && session.active) {
            session.set('app', appName);
            session.set('lang', req.app.lang);
            session.set('url', routeHelper.getBaseUrl(appName) + req.url.path);
        }
    }

    /**
     * Get the domain map by inspecting the app files
     * @returns {{}}
     */
    function getDomainMap() {
        var domainMap = { 'www': 'www' };  // temp hack for mobile redirect stuff (remove later)
        _.each(appConfigs, function (appConfig, appName) {
            var domain = appConfig.domain || appName;  // by default domain is the app name
            domainMap[domain] = appName;
        });

        return domainMap;
    }

    /**
     * Figure out the language and target app
     * @param ctx
     * @returns {Q}
     */
    function init(ctx) {
        var domainMap = getDomainMap();

        // for each request we need to set the proper context
        ctx.server.ext('onRequest', function (req, reply) {
            setLanguage(req);
            setAppInfo(req, domainMap);

            var appName = req.app.name;
            var lang = req.app.lang;
            if (req.app.isLegacyMobile || appName === 'www' || req.app.domain === 'contact') {
                appName = appName === 'www' ? 'contact' : appName;
                reply.redirect(routeHelper.getBaseUrl(appName, lang) + req.url.path).permanent(true);
                return;
            }

            setContext(req);
            reply.continue();
        });

        return new Q(ctx);
    }

    // all functions exposed for testing purposes
    return {
        setLanguage: setLanguage,
        setAppInfo: setAppInfo,
        setContext: setContext,
        getDomainMap: getDomainMap,
        init: init
    };
};
