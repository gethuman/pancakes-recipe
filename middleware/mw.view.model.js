/**
 * Author: Jeff Whelpley
 * Date: 10/20/14
 *
 * This module is used to update a model after it is initially created (i.e. database
 * calls, etc.) but BEFORE it is used to render the page.
 */
module.exports = function (_, appConfigs, i18n, config) {

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

        // add the page head info
        if (model.pageHead) {
            model.pageHead.title = i18n.translate(model.pageHead.title);
            model.pageHead.description = i18n.translate(model.pageHead.description) || model.pageHead.title;

            var keywords = model.pageHead.keywords;
            keywords = (_.isString(keywords) ? keywords.split(',') : keywords) || [];
            keywords = keywords.map(function (keyword) { return i18n.translate(keyword); });
            model.pageHead.keywords = keywords.join(',');
        }

        model.pageCssId         = config.projectPrefix + '-' + routeInfo.name.replace('.', '-');
        model.versioningEnabled = config.env !== 'dev';
        model.clientApp         = config.projectPrefix + appPascal + 'App';
        model.staticVersion     = config.staticVersion;
        model.lang              = routeInfo.lang || 'en';
        model.stateData         = routeInfo.data || {};
        model.gaTrackingCode    = appConfig.trackingCode;
        model.serverOnly        = model.serverOnly || routeInfo.query.server || false;
        model.env               = config.env;

        var staticSSL   = (config[appName] && config[appName].useSSL !== undefined) ?
            config[appName].useSSL : config.useSSL;
        var staticFileRoot = (staticSSL ? 'https://' : 'http://') + config.staticFiles.assets + '/';

        model.clientData = {
            config: _.extend({ staticFileRoot: staticFileRoot }, config.webclient),
            context: {
                app:                appName,
                lang:               model.lang
            },
            initialSearchResults:   model.searchResults
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
