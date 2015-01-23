/**
 * Author: Jeff Whelpley
 * Date: 3/26/14
 *
 * Routes for the API
 */
module.exports = function (Q, pancakes, mwCommonRoutes, config, AppError) {

    /**
     * Initialize all the API server routes
     * @param ctx
     * @returns {Q}
     */
    function init(ctx) {
        var server = ctx.server;

        // add common routes
        mwCommonRoutes(server);

        // add all the dynamic API routes
        pancakes.addApiRoutes({
            server:     server,
            auth:       auth,
            hosts:      config.corsHosts,
            apiPrefix:  '/' + config.api.version
        });

        // finally catch all for 404 error handler
        server.route({
            method:     '*',
            path:       '/{p*}',

            handler: function notFoundHandler(request, reply) {

                // this is only requested when a user looks at the API through a browser
                if (request.url.path === '/favicon.ico') {
                    reply('');
                }
                else {
                    reply(new AppError({
                        code:   'not_found',
                        msg:    request.method + ' ' + request.url.path + ' is not a valid request'
                    }));
                }
            }
        });

        return new Q(ctx);
    }

    /**
     * Function to change the user in session
     * @param request
     * @returns {Function}
     */
    function auth(request) {
        return function (user) {
            if (!request.session) { return user; }

            user ?
                request.session.set('userId', user._id + '') :
                request.session.set('userId', null);

            return user;
        };
    }

    // expose functions
    return {
        init: init,
        auth: auth
    };
};
