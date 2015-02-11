/**
 * Author: Jeff Whelpley
 * Date: 2/12/14
 *
 * Testing date utils
 */
var name        = 'utils/date.utils';
var taste       = require('../pancakes.taste.js')();
var dateUtils   = taste.flapjack(name);

describe('UNIT ' + name, function () {

    describe('datePlusFrequency()', function () {
        var millisInMin = 60000;
        var freqExpectedMins = function (frequency, expectedMins) {
            var date = new Date();
            var expected = new Date(date.getTime() + (expectedMins * millisInMin));
            var actual = dateUtils.datePlusFrequency(date, frequency);
            actual.should.deep.equal(expected);
        };

        it('should return back time in an hour by default', function () {
            var expectedLowerEnd = new Date((new Date()).getTime() + (60 * millisInMin));
            var expectedHigherEnd = new Date(expectedLowerEnd.getTime() + 1000);
            var actual = dateUtils.datePlusFrequency();
            actual.should.be.at.least(expectedLowerEnd);
            actual.should.be.at.most(expectedHigherEnd);
        });

        it('should set date far in the future for frequency none', function () {
            var min = 500000;
            var date = new Date();
            var frequency = 'none';
            var expectedLowerEnd = new Date(date.getTime() + (min * millisInMin));
            var actual = dateUtils.datePlusFrequency(date, frequency);
            actual.should.be.at.least(expectedLowerEnd);
        });

        it('should set date 1 minute out for frequency instant', function () {
            freqExpectedMins('instant', 1);
        });

        it('should set date 60 minutes out for frequency hourly', function () {
            freqExpectedMins('hourly', 60);
        });

        it('should set date 1440 minutes out for frequency daily', function () {
            freqExpectedMins('daily', 1440);
        });

        it('should set date 10080 minutes out for frequency weekly', function () {
            freqExpectedMins('weekly', 10080);
        });

        it('should set date 0 minutes out for invalid frequencies', function () {
            freqExpectedMins('asdfasdf', 0);
        });
    });

    describe('serializeDate()', function () {
        it('should call toString() on a date passed in', function () {
            var date = new Date();
            var expected = date.toString();
            var actual = dateUtils.serializeDate(date);
            actual.should.equal(expected);
        });

        it('should return back anything that is not a date', function () {
            var data = 123;
            var actual = dateUtils.serializeDate(data);
            actual.should.equal(data);
        });
    });

    describe('serializeAllDates()', function () {
        it('should serialize one date', function () {
            var date = new Date();
            var expected = date.toString();
            var actual = dateUtils.serializeAllDates(date);
            actual.should.equal(expected);
        });

        it('should serialize all dates in an array', function () {
            var data = [(new Date()), 'blah', (new Date())];
            var expected = [data[0].toString(), 'blah', data[2].toString()];
            var actual = dateUtils.serializeAllDates(data);
            actual.should.deep.equal(expected);
        });

        it('should serialize all dates in an object', function () {
            var data = { one: new Date(), two: 'blah', three: new Date() };
            var expected = { one: data.one.toString(), two: 'blah', three: data.three.toString() };
            var actual = dateUtils.serializeAllDates(data);
            actual.should.deep.equal(expected);
        });
    });
});