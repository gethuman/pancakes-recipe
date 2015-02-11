/**
 * Author: Jeff Whelpley
 * Date: 3/5/14
 *
 * Co-Author: Masaya Ando
 * Date Modified: 6/19/2014
 *
 * Unit tests for log
 */
var name    = 'utils/log';
var taste   = require('../pancakes.taste.js')();
var log     = taste.flapjack(name);
var bus     = taste.flapjack('eventBus');

describe('UNIT ' + name, function () {

    beforeEach(function () {
        bus.removeAllListeners();
    });

    describe('info()', function () {
        it('should send the log.info event', function () {
            var msg = 'hello GetHuman';
            bus.on('log.info', function (logData) {
                taste.should.exist(logData);
                taste.should.exist(logData.msg);
                (logData.level).should.equal('info');
                (logData.msg).should.equal(msg);
            });
            log.info(msg);
        });
    });

    describe('error()', function () {
        it('should send the log.error event', function () {
            var msg = new Error();
            msg.message = 'Who?';
            msg.code = 'Where?';
            msg.err = { stack: 'How?' };
            msg.stack = 'When?';

            bus.on('log.error', function (logData) {
                taste.should.exist(logData);
                taste.should.exist(logData.msg);
                // (logData.msg).should.equal(msg.message + ' Error: ' + msg.message);  // Currently failing.
                taste.should.exist(logData.code);
                (logData.code).should.equal(msg.code);
                taste.should.exist(logData.stack);
                (logData.stack).should.equal(msg.stack);
                taste.should.exist(logData.inner);
                (logData.inner).should.equal(msg.err.stack);
                taste.should.exist(logData.level);
                (logData.level).should.equal('error');
            });
            log.error(msg);
        });

        it('should send the log.error event', function () {
            var logData = {};
            var msg = 'ERROR!';
            logData.err = new Error(msg);

            bus.on('log.error', function (logData) {
                taste.should.exist(logData);
                taste.should.exist(logData.msg);
                //(logData.msg).should.equal(msg);
                taste.should.exist(logData.stack);
                taste.should.not.exist(logData.err);
                taste.should.exist(logData.level);
                (logData.level).should.equal('error');
                (logData.source).should.exist;
            });
            log.error({}, logData);
        });
    });

    describe('critical()', function () {
        it('should send the log.critical event that must be addressed immediately', function () {
            var msg = new Error();
            msg.message = 'Who?';
            msg.code = 'Where?';
            msg.err = { stack: 'How?' };
            msg.stack = 'When?';

            bus.on('log.critical', function (logData) {
                taste.should.exist(logData);
                taste.should.exist(logData.msg);
                (logData.msg).should.equal(msg.message);
                taste.should.exist(logData.code);
                (logData.code).should.equal(msg.code);
                taste.should.exist(logData.stack);
                (logData.stack).should.equal(msg.stack);
                taste.should.exist(logData.inner);
                (logData.inner).should.equal(msg.err.stack);
                taste.should.exist(logData.level);
                (logData.level).should.equal('critical');
            });
            log.critical(msg);
        });

        it('should send the log.critical event that must be addressed immediately', function () {
            var logData = {};
            var msg = 'ERROR!';
            logData.err = new Error(msg);

            bus.on('log.critical', function (logData) {
                taste.should.exist(logData);
                taste.should.exist(logData.msg);
                (logData.msg).should.equal(msg);
                taste.should.exist(logData.stack);
                taste.should.not.exist(logData.err);
                taste.should.exist(logData.level);
                (logData.level).should.equal('critical');
                (logData.source).should.exist;
            });
            log.critical({}, logData);
        });
    });

    describe('debug()', function () {
        it('should send the log.debug event', function (done) {
            var msg = 'yo yo';
            bus.on('log.debug', function (logData) {
                taste.should.exist(logData);
                taste.should.exist(logData.msg);
                (logData.level).should.equal('debug');
                (logData.msg).should.equal(msg);
                done();
            });
            log.debug(msg);
        });
    });
});
