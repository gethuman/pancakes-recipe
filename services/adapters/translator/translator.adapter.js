/**
 * Author: Jeff Whelpley
 * Date: 6/12/15
 *
 * This adapter is a wrapper around the Google Translate API.
 * Translations from the local system can be sent to Google
 * Translate in order to get back the appropriate translation
 */
var Q           = require('q');
var _           = require('lodash');
var googleInit  = require('google-translate');
var translator  = null;
var i18nVarExpr = /(?:\{\{\s*)([^\{\}]*)(?:\s*\}\})/g;

/**
 * Auth to google with the translator api key
 * @param config
 */
function init(config) {
    translator = googleInit(config.translator.apiKey);
    return config;
}

/**
 * Creating a new translator adapter.
 * @constructor
 */
function TranslatorAdapter() {}

// init is static function on class
_.extend(TranslatorAdapter, {
    init: init
});

// instance functions
_.extend(TranslatorAdapter.prototype, {

    /**
     * Translate one string with one language to another
     * @param req
     */
    translate: function translate(req) {
        var deferred = Q.defer();
        var text = req.text;
        var i18nVars = text.match(i18nVarExpr);
        var replaceVars = [];
        var i;

        // loop through {{ }} values and replace so google doesn't translate them
        if (i18nVars) {
            for (i = 0; i < i18nVars.length; i++) {
                replaceVars.push(i18nVars[i]);
                text = text.replace(i18nVars[i], '{' + i + '}');
            }
        }

        translator.translate(text, req.lang, function (err, translation) {
            if (err) { deferred.reject(err); }

            // if there are replace vars, put them back in the string
            var translatedText = translation.translatedText;
            for (i = 0; i < replaceVars.length; i++) {
                translatedText = translatedText.replace('{' + i + '}', replaceVars[i]);
            }

            deferred.resolve(translatedText);
        });

        return deferred.promise;
    }
});

// return the class
module.exports = TranslatorAdapter;