/**
 * Author: Jeff Whelpley
 * Date: 6/12/15
 *
 * This is used to do one of two things:
 *      1) send untranslated text from the translation table to Google Translate
 *      2) generate translations.js file that is used by the app
 *
 * Examples:
 *      Translate all untranslated text and update the translations file
 *          node batch -a translation
 *      Only translate answers
 *          node batch -a translation -t [translate|export]
 */
module.exports = function (Q, _, translationService, translationTranslatorService, fs) {
    var caller = translationService.admin;

    /**
     * Run the translate job
     * @param opts
     */
    function run(opts) {
        var target = (opts && opts.target) || '';
        var doTranslate = target !== 'export';
        var doExport = target !== 'translate';

        // translate untranslated text
        return (doTranslate ? sendAllItemsToTranslator() : new Q())
            .then(function () {

                // export translations to JSON
                return doExport ? exportToJson(opts.rootDir) : new Q();
            });
    }

    /**
     * Find all untranslated text and send it to the translator
     * @returns {*}
     */
    function sendAllItemsToTranslator() {
        var where = { status: { $exists: false } };
        return translationService.find({ caller: caller, where: where })
            .then(function (itemsToTranslate) {
                itemsToTranslate = itemsToTranslate || [];

                return Q.all(itemsToTranslate.map(function (item) {
                    return sendItemToTranslator(item);
                }));
            });
    }

    /**
     * Send text to the translator
     * @param itemToTranslate
     * @returns {*}
     */
    function sendItemToTranslator(itemToTranslate) {
        return translationTranslatorService.translate({
            caller: caller,
            text:   itemToTranslate.text,
            lang:   itemToTranslate.lang
        })
            .then(function (translatedText) {
                return translationService.update({
                    caller: caller,
                    _id: itemToTranslate._id,
                    data: {
                        translated: translatedText,
                        status:     'completed'
                    }
                });
            });
    }

    /**
     * From a list of translation objects from the database,
     * create an object that can be exported to a JSON file.
     * @param list
     */
    function listToObject(list) {
        var obj = {};

        _.each(list, function (item) {

            // skip if no translation
            if (!item || !item.translated) { return; }

            // otherwise get app name and language
            var appName = item.appName || 'common';
            var lang = item.lang;

            obj[appName] = obj[appName] || {};
            obj[appName][lang] = obj[appName][lang] || {};
            obj[appName][lang][item.text] = item.translated;
        });

        return obj;
    }

    /**
     * Export all translations to JSON
     * @param rootDir
     */
    function exportToJson(rootDir) {
        return translationService.find({ caller: caller, where: { status: 'completed' } })
            .then(function (listOfTranslations) {

                // convert list of translations into JSON object
                var json = listToObject(listOfTranslations);

                // save the JSON object to the translations.json file in {rootDir}/utils
                var deferred = Q.defer();

                var jsonFile = rootDir + '/utils/translations.json';
                fs.writeFile(jsonFile, JSON.stringify(json), function (err) {
                    err ? deferred.reject(err) : deferred.resolve();
                });

                return deferred.promise;
            });
    }

    return {
        sendItemToTranslator: sendItemToTranslator,
        sendAllItemsToTranslator: sendAllItemsToTranslator,
        listToObject: listToObject,
        exportToJson: exportToJson,
        run: run
    };
};