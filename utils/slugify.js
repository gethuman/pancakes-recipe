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
        // "replace 1+ non-alphanumerics with - and then trim - from the start and end"
        return val.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^\-|\-$/g, '');
        /*
        return val
            .replace(/\//g, '-')
            .replace(/[^a-zA-Z0-9\- ]/g, '')
            .trim()
            .replace(/ /g, '-')
            .replace(/--/g, '-');
            */
    };

    // CA: propose changing to: return val.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^\-|\-$/g, '');
};

