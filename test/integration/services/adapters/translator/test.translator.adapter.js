/**
 * Author: Jeff Whelpley
 * Date: 6/12/15
 *
 * Test translations to Goolge Translate
 */
var name        = 'services/adapters/translator/translator.adapter';
var taste       = require('../../../../pancakes.taste.js')();
var Adapter     = taste.target(name);
var adapter     = new Adapter();

function translate(text, lang, expected, done) {
    adapter.translate({ text: text, lang: lang })
        .then(function (actual) {
            actual.should.equal(expected);
            done();
        })
        .catch(done);
}

describe('INTEGRATION ' + name, function () {

    before(function () {
        Adapter.init(taste.config);
    });

    describe('translate()', function () {
        it('should translate Hello, Jeff to Bonjour, Jeff in French', function (done) {
            translate('Hello, Jeff', 'fr', 'Bonjour, Jeff', done);
        });

        it('should translate with a {{0}}', function (done) {
            translate('Hello, {{0}}', 'fr', 'Bonjour, {{0}}', done);
        });

        it('should translate with a {{company}}', function (done) {
            translate('Hello, {{company}}', 'fr', 'Bonjour, {{company}}', done);
        });
    });
});