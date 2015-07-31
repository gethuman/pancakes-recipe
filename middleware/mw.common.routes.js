/**
 * Author: Jeff Whelpley
 * Date: 10/20/14
 *
 * Common routes for API and web
 */
module.exports = function (_, config) {
    var cors = {
        origin:         config.corsHosts,
        headers:        ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'X-Requested-With', 'Authorization'],
        methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials:    true
    };

    var appleTouchIcons = {
        'apple-touch-icon.png':                     'logo-32.png',
        'apple-touch-icon-precomposed.png':         'logo-32.png',
        'apple-touch-icon-32x32.png':               'logo-32.png',
        'apple-touch-icon-32x32-precomposed.png':   'logo-32.png',
        'apple-touch-icon-60x60.png':               'logo-60.png',
        'apple-touch-icon-60x60-precomposed.png':   'logo-60.png',
        'apple-touch-icon-76x76.png':               'logo-76.png',
        'apple-touch-icon-76x76-precomposed.png':   'logo-76.png',
        'apple-touch-icon-120x120.png':             'logo-120.png',
        'apple-touch-icon-120x120-precomposed.png': 'logo-120.png',
        'apple-touch-icon-152x152.png':             'logo-152.png',
        'apple-touch-icon-152x152-precomposed.png': 'logo-152.png',
        'apple-touch-icon-180x180.png':             'logo-180.png',
        'apple-touch-icon-180x180-precomposed.png': 'logo-180.png'
    };

    return function commonRoutes(server) {
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

        server.route({
            method:     'GET',
            path:       '/favicon.ico',
            config:     { cache: { expiresIn: 86400001 } },

            handler: function (request, reply) {
                reply().header('Content-Type', 'image/x-icon');
            }
        });

        _.each(appleTouchIcons, function (localIcon, appleIcon) {
            server.route({
                method:     'GET',
                path:       '/' + appleIcon,
                config:     { cache: { expiresIn: 86400001 } },
                handler: function (request, reply) {
                    reply.file(config.projectDir + '/assets/img/' + localIcon);
                }
            });
        });
    };
};
