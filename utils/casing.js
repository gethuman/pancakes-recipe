/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 7/8/14
 *
 * Deals with conversion between different types of cases
 */
module.exports = function (_) {

    /**
     * Convert to camelCase
     * @param str
     * @param delim
     */
    function camelCase(str, delim) {
        var delims = delim || ['_', '.', '-'];

        if (!_.isArray(delims)) {
            delims = [delims];
        }

        _.each(delims, function (adelim) {
            var codeParts = str.split(adelim);
            var i, codePart;

            for (i = 1; i < codeParts.length; i++) {
                codePart = codeParts[i];
                codeParts[i] = codePart.substring(0, 1).toUpperCase() + codePart.substring(1);
            }

            str = codeParts.join('');
        });

        return str;
    }

    /**
     * Convert a camelCase string into dash case
     * @param str
     */
    function dashCase(str) {
        var newStr = '';

        for (var i = 0, len = str.length; i < len; i++) {
            if (str[i] === str[i].toUpperCase()) { newStr += '-'; }
            newStr += str[i].toLowerCase();
        }

        return newStr;
    }

    /**
     * Convert a dash string to dash Proper:
     * @param str
     */
    function dashProperCase(str) {
        if ( !str.length ) {
            return str;
        }
        return str.split('-').map(function (piece) {
            if ( piece.length ) {
                return piece.substring(0, 1).toUpperCase() + piece.substring(1);
            }
            return piece;
        }).join('-');
    }

    // expose functions
    return {
        camelCase: camelCase,
        dashCase: dashCase,
        dashProperCase: dashProperCase
    };
};
