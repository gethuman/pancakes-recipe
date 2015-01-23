/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 9/19/14
 *
 * This is a simple utility that is used to abstract out the timeout
 * function for client and server. The reason this is needed is that
 * the annotation technique for injection can only inject modules,
 * not core functions (i.e. setTimeout)
 */
module.exports = {

    client: function ($timeout) {
        return $timeout;
    },

    server: function () {
        return setTimeout;
    }
};