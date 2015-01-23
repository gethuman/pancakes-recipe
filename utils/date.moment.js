/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 9/12/14
 *
 * Abstraction that allows us to reference moment in the same way
 */
module.exports = {

    server: function (moment) {
        return moment;
    },

    client: function (extlibs) {
        return extlibs.get('moment');
    }
};