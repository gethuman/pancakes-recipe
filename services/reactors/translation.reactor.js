/**
 * Author: Jeff Whelpley
 * Date: 6/11/15
 *
 * The purpose of this reactor is to take i18n.missing events
 * and save the data to the database so that it can be later
 * processed.
 */
var _ = require('lodash');
var Q = require('q');
var savedTranslations = {};

/**
 * Using the translationService, save the missing i18n translation
 *
 * @param translationService
 * @param missingData
 */
function save(translationService, missingData) {
    var slug = missingData.lang + '||' + missingData.value;
    var data = _.extend(missingData, { slug: slug });
    var caller = translationService.admin;

    if (savedTranslations[slug]) {
        return new Q(savedTranslations[slug]);
    }

    return translationService.find({ caller: caller, where: { slug: slug }, findOne: true })
        .then(function (translation) {
            return translation || translationService.create({ caller: caller, data: data });
        })
        .then(function (translation) {
            savedTranslations[slug] = translation;
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