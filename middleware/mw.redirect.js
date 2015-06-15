/**
 * Author: Jeff Whelpley
 * Date: 6/15/15
 *
 *
 */
module.exports = function (Q) {


    /**
     * Check to see if a given request should be redirected
     * to another URL based on either SSL or redirects in
     * app config.
     *
     * @param req
     * @param reply
     */
    function checkIfRedirect(req, reply) {

    }

    /**
     * Add middleware for doing redirects
     */
    function init(ctx) {
        var server = ctx.server;
        server.ext('onPreAuth', checkIfRedirect);
        return new Q(ctx);
    }

    return {
        init: init
    };
};