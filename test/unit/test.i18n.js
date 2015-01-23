/**
 * Author: Jeff Whelpley
 * Date: 3/20/14
 *
 * Unit tests for the i18n util
 */
var name    = 'utils/i18n';
var taste   = require('../pancakes.taste.js');
var target  = taste.target(name);

describe('UNIT ' + name, function () {
    var translations = {
        common: {
            foo: {
                fr: 'foofr'
            },
            'yo yo': {
                fr: 'yo yo common'
            }
        },
        contact: {
            'yo yo': {
                fr: 'yo yo contact'
            },
            'another test': {
                fr: 'wazzup'
            },
            '{{numCards}} cool. {{numBlah}} roo.': {
                fr: '{{numBlah}} is the second thing. {{numCards}} is the first thing.'
            }
        }
    };
    var context = {
        get: function (name) {
            switch (name) {
                case 'app': return 'contact';
                case 'lang': return 'fr';
                default: return null;
            }
        }
    };
    var i18n = taste.inject(target, { translations: translations, context: context });

    describe('recordUntranslated()', function () {
        it('should store untranslated value', function () {
            var val = 'some foo';
            var app = 'myApp';
            var lang = 'en';
            var expected = '';
            i18n.recordUntranslated(val, app, lang);
            i18n.untranslated[app][val][lang].should.deep.equal(expected);
        });
    });

    describe('getScopeValue()', function () {
        it('should return back a value', function () {
            var expected = 'val';
            var scope = { foo: { choo: expected }};
            var field = 'foo.choo';
            var actual = i18n.getScopeValue(scope, field);
            actual.should.equal(expected);
        });
    });

    describe('interpolate()', function () {
        it('should replace interpolated values with scope values', function () {
            var val = '{{foo}} is pretty {{blah}}.';
            var scope = { foo: 'Jeff', blah: 'cool' };
            var expected = 'Jeff is pretty cool.';
            var actual = i18n.interpolate(val, scope);
            actual.should.equal(expected);
        });
    });

    describe('translate()', function () {
        it('should return common translation if not in app', function () {
            var text = 'foo';
            var actual = i18n.translate(text);
            actual.should.equal(translations.common.foo.fr);
        });

        it('should return app translation if overrides common', function () {
            var text = 'yo yo';
            var actual = i18n.translate(text);
            actual.should.equal(translations.contact[text].fr);
        });

        it('should return app if no override', function () {
            var text = 'another test';
            var actual = i18n.translate(text);
            actual.should.equal(translations.contact[text].fr);
        });

        it('should interpolate two values without translation', function () {
            var text = '{{numCards}} is a lot. {{numBlah}} is a little.';
            var scope = { numCards: 5, numBlah: 'zzz' };
            var expected = '5 is a lot. zzz is a little.';
            var actual = i18n.translate(text, scope);
            actual.should.equal(expected);
        });

        it('should interpolate two values with translation', function () {
            var text = '{{numCards}} cool. {{numBlah}} roo.';
            var scope = { numCards: 5, numBlah: 'zzz' };
            var expected = 'zzz is the second thing. 5 is the first thing.';
            var actual = i18n.translate(text, scope);
            actual.should.equal(expected);
        });
    });
});