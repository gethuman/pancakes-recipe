/**
 * Author: Jeff Whelpley
 * Date: 3/19/14
 *
 * This utility handles all translations
 */
module.exports = function (_, translations, context, config) {
    // @module({ "client": true })

    var i18nVarExpr = /(?:\{\{\s*)([^\{\}]*)(?:\s*\}\})/g;

    /**
     * Get a value from scope for a given field
     * @param scope
     * @param field
     * @returns {{}}
     */
    function getScopeValue(scope, field) {
        if (!scope || !field) { return null; }

        var fieldParts = field.split('.');
        var pntr = scope;

        _.each(fieldParts, function (fieldPart) {
            if (pntr) {
                pntr = pntr[fieldPart];
            }
        });

        return pntr;
    }

    /**
     * Attempt to interpolate the string
     * @param val
     * @param scope
     * @returns {*}
     */
    function interpolate(val, scope) {

        // if no scope or value with {{ then no interpolation and can just return translated
        if (!scope || !val || !val.match) { return val; }

        // first, we need to get all values with a {{ }} in the string
        var i18nVars = val.match(i18nVarExpr);

        // loop through {{ }} values
        _.each(i18nVars, function (i18nVar) {
            var field = i18nVar.substring(2, i18nVar.length - 2).trim();
            var scopeVal = getScopeValue(scope, field);
            val = val.replace(i18nVar, scopeVal);
        });

        return val;
    }

    /**
     * Translate given text into the target language. If not in the target language,
     * look in english, and then finally just return back the value itself
     *
     * @param val
     * @param scope
     * @param status
     * @returns {string}
     */
    function translate(val, scope, status) {
        var app = (scope && scope.appName) || context.get('app') || '';
        var lang = (scope && scope.lang) || context.get('lang') || 'en';
        var translated;

        if (!val || val.length < 2) { return val; }

        // translations could be either nested (on the server) or at the root (on the client)
        translated = (translations[app] && translations[app][lang] && translations[app][lang][val]) ||
            (_.isString(translations[val]) && translations[val]);

        // if no transation AND caller passed in status object AND lang is not default (i.e. not english),
        // set the status object values which the caller can use to record some info
        // note: this is kind of hacky, but we want the caller (i.e. jng.directives.js) to handle
        // it because jng.directives has more info about the translation than we do at this level
        if (!translated && config.i18nDebug && status && lang !== config.lang.default) {
            status.app = app;
            status.lang = lang;
            status.missing = true;
        }

        // attempt to interpolate and return the resulting value (val if no translation found)
        return interpolate(translated || val, scope);
    }

    // expose functions
    return {
        getScopeValue: getScopeValue,
        interpolate: interpolate,
        translate: translate
    };
};