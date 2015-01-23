/**
 * Author: Jeff Whelpley
 * Date: 4/5/14
 *
 * This middleware is in charge of setting context variables for a web app
 */
module.exports = function (Q, _, appConfigs, config, cls, translations, AppError) {

    /**
     * Set the language depending on a couple different potential sources
     * @param req
     * @param langs An object where keys are all the available language codes (i.e. en, fr, etc.)
     */
    function setLanguage(req, langs) {
        req.app.lang = req.query.lang ||                            // lang in query string takes precedence
            (req.info.host.charAt(2) === '.' &&
                langs[req.info.host.substring(0, 2)]) ||            // else check host name (ex. fr.gethuman.com)
            config.defaultLang ||                                   // else use default site in config
            'en';                                                   // else just use english
    }

    /**
     * Set the app domain and name
     * @param req
     * @param domainMap Key is subdomain value, value is the name of the app
     */
    function setAppInfo(req, domainMap) {
        var host = req.info.host;
        var domain;

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

        // if the domain is not in the map, throw an error
        var appName = domainMap[domain];
        if (!appName) {
            throw AppError.invalidRequestError('No valid domain in requested host: ' + req.info.host);
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
        if (session) {
            session.set('app', req.app.name);
            session.set('lang', req.app.lang);
            session.set('visitorId', req.session && req.session.get('visitorId'));
        }
    }

    /**
     * Get the potential languages by inspecting the translations module
     */
    function getPotentialLanguages() {
        var langs = {};
        _.each(translations.common, function (strTranslations) {
            _.each(strTranslations, function (translatedStr, lang) {
                langs[lang] = true;
            });
        });

        return langs;
    }

    /**
     * Get the domain map by inspecting the app files
     * @returns {{}}
     */
    function getDomainMap() {
        var domainMap = {};
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
        var langs = getPotentialLanguages();
        var domainMap = getDomainMap();

        // for each request we need to set the proper context
        ctx.server.ext('onRequest', function (req, reply) {
            setLanguage(req, langs);
            setAppInfo(req, domainMap);
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
        getPotentialLanguages: getPotentialLanguages,
        getDomainMap: getDomainMap,
        init: init
    };
};
