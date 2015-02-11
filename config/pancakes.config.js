/**
 * Author: Jeff Whelpley
 * Date: 2/10/15
 *
 * Pancakes config for testing out the pancakes-recipe code
 */
var path = require('path');

module.exports = {
    debug:      false,
    preload:    ['utils', 'middleware'],
    rootDir:    path.join(__dirname, '/..'),
    require:    require
};