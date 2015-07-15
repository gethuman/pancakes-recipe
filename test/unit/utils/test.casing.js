/**
 * Copyright 2015 GetHuman LLC
 * Author: christian
 * Date: 7/14/15
 *
 * I forgot to write about what this component does
 */
var name    = 'utils/casing';
var taste   = require('../../pancakes.taste.js')();
var casing = taste.flapjack(name);

describe('UNIT ' + name, function () {
    it('should convert a dash-case-string to Dash-Case-String with dashProperCase()', function () {
        var str = 'i-am-dash';
        var expected = 'I-Am-Dash';
        var actual = casing.dashProperCase(str);
        actual.should.equal(expected);
    });
});
