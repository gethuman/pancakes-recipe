/**
 * Author: Jeff Whelpley
 * Date: 4/28/14
 *
 * This middleware deals with the cookies that are used by the web server.
 */
module.exports = function (Q, config) {
    var cookieConfig = config.security.cookie || {};

    /**
     * Register the cookie jar using the Hapi yar library
     * @param server
     */
    function registerCookieJar(server) {
        var deferred = Q.defer();

        server.register({
            register: require('yar'),
            options: {
                cache: {
                    expiresIn:  cookieConfig.ttl
                },
                cookieOptions: {
                    clearInvalid: true,
                    password:   cookieConfig.password,
                    domain:     cookieConfig.domain,
                    isSecure:   cookieConfig.isSecure
                }
            }
        }, function (err) {
            err ? deferred.reject(err) : deferred.resolve(err);
        });

        return deferred.promise;
    }

    /**
     * Register the cookie used for the JSON web token.
     * This is only used on the webserver since the API
     * will get the token in the header of the request.
     *
     * @param server
     */
    function registerJwtCookie(server) {
        server.state('jwt', {
            ttl:        cookieConfig.ttl,
            domain:     cookieConfig.domain,
            isSecure:   cookieConfig.isSecure,
            path:       '/'
        });
    }

    /**
     * Get the JWT token from the cookie and stick it into the request
     * @param req
     * @param reply
     */
    function getJwtFromCookie(req, reply) {
        var jwt = req.state && req.state.jwt;
        if (jwt) {
            req.headers = req.headers || {};
            req.headers.authorization = jwt;
        }

        reply.continue();
    }

    /**
     * Register the cookie jar and move the token from the cookie to the request auth
     * @param ctx
     */
    function init(ctx) {
        var server = ctx.server;

        return registerCookieJar(server)
            .then(function () {
                registerJwtCookie(server);
                server.ext('onPreAuth', getJwtFromCookie);

                return new Q(ctx);
            });
    }

    // exposing functions
    return {
        registerJwtCookie: registerJwtCookie,
        registerCookieJar: registerCookieJar,
        getJwtFromCookie: getJwtFromCookie,
        init: init
    };
};
