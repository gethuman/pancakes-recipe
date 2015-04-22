/**
 * Author: Jeff Whelpley
 * Date: 2/13/14
 *
 * Unit test slugify
 */
var name    = 'utils/slugify';
var taste   = require('../../pancakes.taste.js')();
var slugify = taste.flapjack(name);

describe('UNIT ' + name, function () {
    it('should replace any non-alphanumerics with dashes and trim dashes from ends', function () {
        var subject = '??What is another..2342!@#$%';
        var expected = 'What-is-another-2342';
        var actual = slugify(subject) || '';
        actual.should.equal(expected);
    });
});
