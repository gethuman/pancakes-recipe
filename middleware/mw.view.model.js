/**
 * Author: Jeff Whelpley
 * Date: 10/20/14
 *
 * This module is used to update a model after it is initially created (i.e. database
 * calls, etc.) but BEFORE it is used to render the page.
 */
module.exports = function (_, appConfigs, i18n, config, translations) {

    // static model values that do not change
    var versioningEnabled = config.env !== 'dev';
    var staticVersion = config.staticVersion;
    var env = config.env;

    /**
     * Add to the model with certain custom values for the app
     * @param model
     * @param routeInfo
     * @returns {*|{}}
     */
    function addToModel(model, routeInfo) {
        model = model || {};

        var appName     = model.appName = routeInfo.appName;
        var appConfig   = appConfigs[appName];
        var appPascal   = appName.substring(0, 1).toUpperCase() + appName.substring(1);
        var lang        = routeInfo.lang || 'en';
        var ga          = appConfig.googleAnalytics || {};
        var gaLang      = ga[lang] || {}

        // add the page head info
        if (model.pageHead) {
            model.pageHead.title = i18n.translate(model.pageHead.title);
            model.pageHead.description = i18n.translate(model.pageHead.description) || model.pageHead.title;

            var keywords = model.pageHead.keywords;
            keywords = (_.isString(keywords) ? keywords.split(',') : keywords) || [];
            keywords = keywords.map(function (keyword) { return i18n.translate(keyword); });
            model.pageHead.keywords = keywords.join(',');
        }

        // static data that doesn't change
        model.versioningEnabled = versioningEnabled;
        model.staticVersion     = staticVersion;
        model.env               = env;

        // changes per request
        model.pageCssId         = config.projectPrefix + '-' + routeInfo.name.replace('.', '-');
        model.clientApp         = config.projectPrefix + appPascal + 'App';
        model.stateData         = routeInfo.data || {};
        model.gaTrackingCode    = gaLang.trackingCode;
        model.serverOnly        = model.serverOnly || routeInfo.query.server || false;
        model.lang              = lang;


        //******************************** WEB CLIENT CONFIG + DATA ****************************************

        var staticSSL   = (config[appName] && config[appName].useSSL !== undefined) ?
            config[appName].useSSL : config.useSSL;
        var staticFileRoot = (staticSSL ? 'https://' : 'http://') + config.staticFiles.assets + '/';

        model.clientData = {
            config: _.extend({
                staticFileRoot: staticFileRoot,
                useSSL: (config[appName] && config[appName].useSSL !== undefined) ? config[appName].useSSL : config.useSSL
            }, config.webclient),
            context: {
                app:                appName,
                lang:               lang
            },
            translations:           translations && translations[appName] && translations[appName][lang]
        };

        if (config.realtime) {
            model.clientData.config.realtime = {
                postsHost:          config.realtime.postsHost,
                presenceHost:       config.realtime.presenceHost,
                adminHost:          config.realtime.adminHost
            };
        }

        return model;
    }

    // expose functions
    return {
        addToModel: addToModel
    };
};
