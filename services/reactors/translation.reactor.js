/**
 * Author: Jeff Whelpley
 * Date: 6/11/15
 *
 * The purpose of this reactor is to take i18n.missing events
 * and save the data to the database so that it can be later
 * processed.
 */
//var Q = require('q');
//var savedTranslations = {};
var log = console;

/**
 * Using the translationService, save the missing i18n translation
 *
 * @param translationService
 * @param missingData
 */
function save(translationService, missingData) {
    var caller = translationService.admin;

    // first check to see if we already saved this translation
    //var savedKey = missingData.appName + '||' + missingData.lang + '||' + missingData.text;
    //if (savedTranslations[savedKey]) {
    //    return new Q(savedTranslations[savedKey]);
    //}

    // we don't set the appName initially so we can check to see if there are multiple apps
    var appName = missingData.appName;
    delete missingData.appName;

    return translationService.update({
        caller: caller,
        where:  { lang: missingData.lang, text: missingData.text },
        data:   missingData,
        upsert: true
    })
        .then(function (translation) {

            // if the saved translation app name diff than the input here, then update to common
            if (translation && appName && translation.appName !== 'common' && translation.appName !== appName) {
                return translationService.update({
                    caller: caller,
                    _id:    translation._id,
                    data: {

                        // if translation already has appName, then set to common, else set to new appName
                        appName: translation.appName ? 'common' : appName
                    }
                });
            }
            else {
                return translation;
            }
        })
        .then(function (translation) {

            // if no translation then there is something wrong
            if (!translation) {
                log.error('No translation saved for ' + JSON.stringify(missingData));
            }

            //savedTranslations[savedKey] = translation;
            return translation;
        });
}

/**
 * If we are in debug mode for i18n, then set up an event bus listener
 * for the i18n.missing event (raised by the jng.directives translation directives)
 *
 * @param opts
 */
function init(opts) {
    var config = opts.config;
    var pancakes = opts.pancakes;
    var eventBus = pancakes.cook('eventBus');
    var translationService = pancakes.cook('translationService');
    log = pancakes.cook('log');

    if (config.i18nDebug) {
        eventBus.on('i18n.missing', function (missingData) {
            save(translationService, missingData).done();
        });
    }
}

module.exports = {
    save: save,
    init: init
};