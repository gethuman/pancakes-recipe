/**
 * Author: Jeff Whelpley
 * Date: 2/10/14
 *
 * Unit test for applying schema to some data
 */
var name        = 'utils/apply.schema';
var taste       = require('../pancakes.taste.js')();
var applySchema = taste.flapjack(name);

describe('UNIT ' + name, function () {

    it('should not remove the _id field', function () {
        var data = { _id: 123 };
        var schema = {};
        var expected = { _id: 123 };
        var actual = applySchema(data, schema) || {};
        actual.should.deep.equal(expected);
    });

    it('should remove a property that does not exist in the schema', function () {
        var data = { one: 'one', two: 'two' };
        var schema = { one: true };
        var expected = { one: 'one' };
        var actual = applySchema(data, schema) || {};
        actual.should.deep.equal(expected);
    });

    it('should filter a sub-objeact', function () {
        var data = { one: { two: 'two', three: 'three' } };
        var schema = { one: { two: true } };
        var expected = { one: { two: 'two' } };
        var actual = applySchema(data, schema) || {};
        actual.should.deep.equal(expected);
    });

    it('should leave a string array as is if in the schema', function () {
        var data = { one: ['val1', 'val2'] };
        var schema = { one: true };
        var expected = { one: ['val1', 'val2'] };
        var actual = applySchema(data, schema) || {};
        actual.should.deep.equal(expected);
    });

    it('should loop through an array and remove a property', function () {
        var data = { one: [{ two: 'two', three: 'three' }] };
        var schema = { one: [{ two: true }] };
        var expected = { one: [{ two: 'two' }] };
        var actual = applySchema(data, schema) || {};
        actual.should.deep.equal(expected);
    });
});