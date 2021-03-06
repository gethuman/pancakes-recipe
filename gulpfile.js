/**
 * Author: Jeff Whelpley
 * Date: 2/9/14
 *
 * Build file for Pancakes
 */
var gulp    = require('gulp');
var taste   = require('taste');
var batter  = require('batter');

batter.whip(gulp, taste, {
    targetDir:      __dirname,
    unitTargetCode: ['utils/*.js', 'middleware/*.js', 'batch/*.js'],
    intTargetCode:  ['middleware/*.js']
});
