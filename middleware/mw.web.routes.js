/**
 * Author: Jeff Whelpley
 * Date: 3/26/14
 *
 * All the web server routes
 */
module.exports = function (Q, pancakes, pageCacheService, mwCommonRoutes, mwTasks, mwViewModel, config, inert) {

    //TODO: lock this down so only from certain origins (also repeated with pancakes.hapi.api)
    var cors = {
        origin:         config.corsHosts || ['*'],
        headers:        ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'X-Requested-With'],
        credentials:    true
    };

    /**
     * Loading web routes
     * @param ctx
     * @returns {Q}
     */
    function init(ctx) {
        var server = ctx.server;

        // add common routes
        mwCommonRoutes(server);

        // route for robots.txt
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

        // this local static dir is only used for dev (prod is on CDN)
        server.register(inert, function () {});
        server.route({
            method:     'GET',
            path:       '/dist/{path*}',
            config:     { cors: cors },
            handler:    { directory: { path: './dist', listing: false, index: false } }
        });

        // add all the pancakes-based web routes
        pancakes.addWebRoutes({
            server:     server,
            preProcess: mwTasks.isTaskHandled,
            addToModel: mwViewModel.addToModel,
            pageCacheService: pageCacheService,
            config: config
        });

        return new Q(ctx);
    }

    // expose functions
    return {
        init: init
    };
};
