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

        // todo: check if this is extraneous now that we have something in mw.invalid.path.js
        server.route({
            method:     'GET',
            path:       '/favicon.ico',
            config:     { cache: { expiresIn: 86400001 } },
            handler:    function (request, reply) {
                //reply().file(config.projectDir + '/assets/img/favicon.ico');
                // todo: ask Jeff how to de-couple this...
                reply().redirect('https://assets.gethuman.com/img/favicon.ico').permanent(true);
            }
        });

        server.route({
            method:     'GET',
            path:       '/browserconfig.xml',
            config:     {cache: {expiresIn: 86400001}},

            handler: function (request, reply) {
                reply('<?xml version="1.0" encoding="utf-8"?><browserconfig><msapplication><tile><square70x70logo src="https://assets.gethuman.com/img/logo-70.png"/><square150x150logo src="https://assets.gethuman.com/img/logo-150.png"/><wide310x150logo src="https://assets.gethuman.com/img/logo-310x150.png"/><square310x310logo src="https://assets.gethuman.com/img/logo-310.png"/><TileColor>#94cb5e</TileColor></tile></msapplication></browserconfig>')
                    .header('Content-Type', 'text/xml');
            }
        })

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
