/**
 * Author: Jeff Whelpley
 * Date: 2/10/14
 *
 * Unit test for base64 encoding
 */
var name    = 'utils/base64';
var taste   = require('../pancakes.taste.js')();
var base64  = taste.flapjack(name);

describe('UNIT ' + name, function () {
    describe('encode()', function () {
        it('should translate values under 64 into one char direct matches', function () {
            base64.encode(5).should.equal('5');
            base64.encode(10).should.equal('A');
            base64.encode(36).should.equal('a');
            base64.encode(62).should.equal('-');
            base64.encode(63).should.equal('_');
        });

        it('should translate values over 64 as appropriate', function () {
            base64.encode(64).should.equal('10');
            base64.encode(345).should.equal('5P');
            base64.encode(3423452).should.equal('D3pS');
        });
    });

    describe('decode()', function () {
        it('should translate single character base 64 representations', function () {
            base64.decode('5').should.equal(5);
            base64.decode('A').should.equal(10);
            base64.decode('a').should.equal(36);
            base64.decode('-').should.equal(62);
            base64.decode('_').should.equal(63);
        });

        it('should translate base64 chars to digits', function () {
            base64.decode('10').should.equal(64);
            base64.decode('5P').should.equal(345);
        });

        it('should throw error if non-base64 char included', function () {
            var fn = function () { base64.decode('+'); };
            taste.expect(fn).to.throw(Error);
        });
    });
});
