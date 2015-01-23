/**
 * Author: Jeff Whelpley
 * Date: 9/12/14
 *
 *
 */
var name        = 'utils/date.formater';
var taste       = require('../pancakes.taste.js');
var dateFormat  = taste.flapjack(name);

describe('UNIT ' + name, function () {
    describe('getFormattedDate()', function () {
        it('should return back 5 minutes ago with defaults', function () {
            var dt = new Date();
            dt.setTime(dt.getTime() - 300000);
            var expected = '5 minutes ago';
            var actual = dateFormat.getFormattedDate(dt);
            actual.should.equal(expected);
        });
        it('should return back 5 mins ago for english short', function () {
            var dt = new Date();
            dt.setTime(dt.getTime() - 300000);
            var expected = '5m ago';
            var actual = dateFormat.getFormattedDate(dt, 'en', 'short');
            actual.should.equal(expected);
        });
        it('should return back il y a 2 heures for french translation', function () {
            var dt = new Date();
            dt.setTime(dt.getTime() - 7200000);
            var expected = 'il y a 2 heures';
            var actual = dateFormat.getFormattedDate(dt, 'fr');
            actual.should.equal(expected);
        });
    });
});