/**
 * Author: Jeff Whelpley
 * Date: 1/18/15
 *
 * This is used to get access to all the common code in this
 * pancakes plugin
 */
var tastePancakes       = require('./test/pancakes.taste');
var RedisAdapter        = require('./services/adapters/redis/redis.adapter');
var ApiclientAdapter    = require('./services/adapters/apiclient/apiclient.adapter');
var TranslatorAdapter   = require('./services/adapters/translator/translator.adapter');
var logReactor          = require('./services/reactors/log.reactor');
var translationReactor  = require('./services/reactors/translation.reactor');

module.exports = {
    rootDir:            __dirname,
    taste:              tastePancakes,
    serverModuleDirs:   ['middleware', 'utils', 'batch'],
    adapters: {
        redis:          RedisAdapter,
        apiclient:      ApiclientAdapter,
        translator:     TranslatorAdapter
    },
    reactors: {
        log:            logReactor,
        translation:    translationReactor
    }
};


