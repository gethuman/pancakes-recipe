/**
 * Author: Jeff Whelpley
 * Date: 3/19/14
 *
 * This utility handles all translations
 */
module.exports = function (_, translations, context, config) {
    // @module({ "client": true })

    var untranslated = {};
    var lastdumpTimestamp = (new Date()).getTime();
    var i18nVarExpr = /(?:\{\{\s*)([^\{\}]*)(?:\s*\}\})/g;

    /**
     * Record value that can't be translated
     * @param val
     * @param app
     * @param lang
     */
    function recordUntranslated(val, app, lang) {
        if (!untranslated[app]) { untranslated[app] = {}; }
        if (!untranslated[app][val]) { untranslated[app][val] = {}; }
        untranslated[app][val][lang] = '';

        // if it has been 60 seconds since our last dump, do another one
        var now = (new Date()).getTime();
        if ((lastdumpTimestamp + 60000) < now) {
            console.log(JSON.stringify(untranslated, undefined, 2));
            lastdumpTimestamp = now;
        }
    }

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
            pntr = pntr[fieldPart];
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
        if (!scope || !val) { return val; }

        // first, we need to get all values with a {{ }} in the string
        var i18nVars = val.match(i18nVarExpr);

        // if no i18nVars found, just return the translated
        if (!i18nVars) { return val; }

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
     * @returns {string}
     */
    function translate(val, scope) {
        var app = context.get('app') || '';
        var lang = context.get('lang') || 'en';
        var translated;

        if (!val) { return val; }

        if (translations[app] && translations[app][val]) {
            translated = translations[app][val][lang];
        }

        // if translation isn't at the app level, try the common level
        if (!translated && translations.common && translations.common[val]) {
            translated = translations.common[val][lang];
        }

        // if no transation, so just record the value so we can translate it later
        if (!translated && config.i18nDebug) {
            recordUntranslated(val, app, lang);
        }

        // attempt to interpolate and return the resulting value (val if no translation found)
        return interpolate(translated || val, scope);
    }

    // expose functions
    return {
        untranslated: untranslated,
        recordUntranslated: recordUntranslated,
        getScopeValue: getScopeValue,
        interpolate: interpolate,
        translate: translate
    };
};