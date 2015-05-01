/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 1/26/14
 *
 */
module.exports = function () {
    // @module({ "client": true })

    /**
     * Function to slugify a string. This replaces all spaces and chars that are not a
     * letter or number with a '-'
     *
     * @param val
     * @returns {string}
     */
    return function (val) {
        val = val || '';
        return val.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^\-|\-$/g, '');
    };
};

