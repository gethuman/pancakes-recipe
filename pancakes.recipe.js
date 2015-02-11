/**
 * Author: Jeff Whelpley
 * Date: 1/18/15
 *
 * This is used to get access to all the common code in this
 * pancakes plugin
 */
var tastePancakes = require('./test/pancakes.taste');

module.exports = {
    rootDir:            __dirname,
    taste:              tastePancakes,
    serverModuleDirs:   ['middleware', 'utils', 'batch']
};


