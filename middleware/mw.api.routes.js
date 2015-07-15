/**
 * Author: Jeff Whelpley
 * Date: 3/26/14
 *
 * Routes for the API
 */
module.exports = function (Q, pancakes, mwCommonRoutes, config, AppError) {
    return {
        init: function init(ctx) {
            var server = ctx.server;

            // add common routes
            mwCommonRoutes(server);

            // add all the dynamic API routes
            pancakes.addApiRoutes({
                server:     server,
                hosts:      config.corsHosts,
                apiPrefix:  '/' + config.api.version
            });

            // this is needed for the OpsWorks healthcheck on AWS (TODO: come up with another solution)
            server.route({
                method:     'GET',
                path:       '/',
                handler:    function (request, reply) { reply('salutations'); }
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
    };
};
