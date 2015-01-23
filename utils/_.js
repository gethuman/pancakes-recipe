/**
 * Author: Jeff Whelpley
 * Date: 4/23/14
 *
 * Abstraction for client/server so we can refer to _ for all utility
 * type functions. This is lodash on the server and angular on the client.
 */
module.exports = {

    /**
     * On the server side, _ is simply lodash
     * @param lodash
     * @returns {*}
     */
    server: function (lodash) {
        return lodash;
    },

    /**
     * On the client side, _ is the angular object
     * combined with a couple aliases to make it
     * equivalent to lodash
     */
    client: function (extlibs) {
        var angular = extlibs.get('angular');

        // adding function to angular to make it equivalent to lodash
        angular.isEqual = angular.equals;
        angular.each = angular.forEach;
        angular.isBoolean = function (obj) {
            return obj === true || obj === false ||
                obj.toString.call(obj) === '[object Boolean]';
        };

        return angular;
    }
};
