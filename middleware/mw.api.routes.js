/**
 * Author: Jeff Whelpley
 * Date: 3/26/14
 *
 * Routes for the API
 */
module.exports = function (Q, pancakes, mwCommonRoutes, config) {
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

            // this is needed for the OpsWorks healthcheck on AWS
            server.route({
                method:     'GET',
                path:       '/',
                handler:    function (request, reply) { reply('salutations'); }
            });

            // route for robots.txt
            // server.route({
            //     method:     'GET',
            //     path:       '/robots.txt',
            //     config:     { cache: { expiresIn: 86400001 } },
            //
            //     handler: function (request, reply) {
            //         reply('User-agent: *\nDisallow: /').header('Content-Type', 'text/plain');
            //     }
            // });
            server.route({
                method:     'GET',
                path:       '/robots.txt',
                config:     { cache: { expiresIn: 86400001 } },

                handler: function (request, reply) {
                    if (config.env === 'production') {
                        reply('User-agent: Mediapartners-Google\nDisallow:\nUser-agent: *\nDisallow: /axj/\nAllow: /')
                            .header('Content-Type', 'text/plain');
                    }
                    else {
                        reply('User-agent: *\nDisallow: /').header('Content-Type', 'text/plain');
                    }
                }
            });

            // finally catch all for 404 error handler
            server.route({
                method:     '*',
                path:       '/{p*}',
                handler: function notFoundHandler(request, reply) {
                    reply('Invalid path').code(404);
                }
            });

            return new Q(ctx);
        }
    };
};
