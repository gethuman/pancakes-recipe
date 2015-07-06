/**
 * Author: Jeff Whelpley
 * Date: 10/20/14
 *
 * Common routes for API and web
 */
module.exports = function (config) {
    var cors = {
        origin:         config.corsHosts,
        headers:        ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'X-Requested-With', 'Authorization'],
        methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials:    true
    };

    return function (server) {
        server.route({
            method:     'OPTIONS',
            path:       '/{path*}',
            config:     { cors: cors },
            handler:    function (request, reply) { reply().code(204); }
        });

        server.route({
            method:     'GET',
            path:       '/ping',

            handler: function (request, reply) {
                reply({
                    alive: 'true',
                    pid:    process.pid,
                    memory: process.memoryUsage(),
                    uptime: process.uptime()
                });
            }
        });

        // temp just used for load testing
        server.route({
            method:     'GET',
            path:       '/loaderio-ffc8a3a108c413a9a91044a7c2f88c10.html',

            handler: function (request, reply) {
                reply('loaderio-ffc8a3a108c413a9a91044a7c2f88c10');
            }
        });
    };
};
