/**
 * Author: Jeff Whelpley
 * Date: 2/13/14
 *
 * Unit test for the data manipulator
 */
var name    = 'utils/obj.utils';
var taste   = require('../../pancakes.taste.js')();
var objUtils = taste.flapjack(name);

describe('UNIT ' + name, function () {

    describe('removeAllFieldsFromObj()', function () {
        it('should remove all fields from data', function () {
            var data = {
                fld1: 'blah',
                fld2: 'another',
                arr1: [{
                    fld2: 'something',
                    fld3: 'one more'
                }],
                arr2: ['booyeah'],
                someObj: {
                    fld2: 'another',
                    subObj: {
                        fld3: 'one',
                        fld2: 'two'
                    }
                }
            };
            var fieldsToRemove = ['fld2', 'arr2'];
            var expected = {
                fld1: 'blah',
                arr1: [{
                    fld3: 'one more'
                }],
                someObj: {
                    subObj: {
                        fld3: 'one'
                    }
                }
            };

            objUtils.removeAllFieldsFromObj(data, fieldsToRemove);
            data.should.deep.equal(expected);
        });
    });

    describe('mapData()', function () {
        it('return back the input object if params invalid', function () {
            var data = { something: 'blah' };
            var expected = { something: 'blah' };
            var actual = objUtils.mapData(null, data) || {};
            actual.should.deep.equal(expected);
        });

        it('should map data from one format to another', function () {
            var map = { col1: 'some.thing.blah' };
            var data = { col1: 'zoom'};
            var expected = {
                some: {
                    thing: {
                        blah: 'zoom'
                    }
                }
            };
            var actual = objUtils.mapData(map, data) || {};
            actual.should.deep.equal(expected);
        });
    });

    describe('getNestedValue()', function () {
        it('should return undefined if value does not exist', function () {
            taste.should.not.exist(objUtils.getNestedValue());
        });

        it('should return undefined field not in data', function () {
            var data = { foo: 'choo' };
            var field = 'blah';
            var actual = objUtils.getNestedValue(data, field);
            taste.should.not.exist(actual);
        });

        it('should return default since no value', function () {
            var data = { foo: 'choo' };
            var field = 'blah';
            var defaultValue = 'boochica';
            var actual = objUtils.getNestedValue(data, field, defaultValue);
            actual.should.equal(defaultValue);
        });

        it('should get a simple value', function () {
            var data = { foo: 'choo' };
            var field = 'foo';
            var expected = 'choo';
            var actual = objUtils.getNestedValue(data, field);
            actual.should.equal(expected);
        });

        it('should get a nested value', function () {
            var data = { foo: { choo: { zoo: 'yep' }} };
            var field = 'foo.choo.zoo';
            var expected = 'yep';
            var actual = objUtils.getNestedValue(data, field);
            actual.should.equal(expected);
        });
    });

    describe('setNestedValue()', function () {
        it('should set a basic value', function () {
            var data = { foo: 3 };
            var field = 'foo';
            var val = 2;
            objUtils.setNestedValue(data, field, val);
            data.foo.should.equal(val);
        });

        it('should set a nested value', function () {
            var data = { foo: { man: { choo: 3 }}};
            var field = 'foo.man.choo';
            var val = 2;
            objUtils.setNestedValue(data, field, val);
            data.foo.man.choo.should.equal(val);
        });

        it('should set a nested value that does not exist', function () {
            var data = {};
            var field = 'foo.man.choo';
            var val = 2;
            objUtils.setNestedValue(data, field, val);
            data.foo.man.choo.should.equal(val);
        });
    });

    describe('matchesCriteria()', function () {
        it('should return true if no params', function () {
            return objUtils.matchesCriteria().should.be.true;
        });

        it('should return false if the data does not match the simple criteria', function () {
            var data = { foo: 'choo' };
            var criteria = { blah: 'zoo' };
            return objUtils.matchesCriteria(data, criteria).should.be.false;
        });

        it('should return false if the data does not match the simple criteria 2', function () {
            var data = { foo: 'choo' };
            var criteria = { foo: 'soo' };
            return objUtils.matchesCriteria(data, criteria).should.be.false;
        });

        it('should return true if the data matches simple criteria', function () {
            var data = { foo: 'choo' };
            var criteria = { foo: 'choo' };
            return objUtils.matchesCriteria(data, criteria).should.be.true;
        });

        it('should return true if the data matches complex criteria', function () {
            var data = { foo: 'choo', woo: { boo: 'la' }};
            var criteria = { foo: 'choo', 'woo.boo': 'la' };
            return objUtils.matchesCriteria(data, criteria).should.be.true;
        });

        it('should return false if no data matches complex criteria', function () {
            var data = { foo: 'choo', woo: { boo: 'la' }};
            var criteria = { foo: 'choo', 'woo.boo': 'sss' };
            return objUtils.matchesCriteria(data, criteria).should.be.false;
        });

        it('should allow the not operand', function () {
            var data = { foo: 'choo', woo: { boo: 'la' }};
            var criteria = { foo: '!la' };
            return objUtils.matchesCriteria(data, criteria).should.be.true;
        });

        it('should allow the not operand with complex material', function () {
            var data = { foo: 'choo', woo: { boo: 'la' }};
            var criteria = { 'woo.boo': '!zoo' };
            return objUtils.matchesCriteria(data, criteria).should.be.true;
        });

    });
});