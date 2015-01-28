/**
 * Author: Jeff Whelpley
 * Date: 3/26/14
 *
 * All the web server routes
 */
module.exports = function (Q, pancakes, pageCacheService, mwCommonRoutes, mwTasks, mwViewModel) {

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
                reply('User-agent: Mediapartners-Google\nDisallow:\nUser-agent: *\nDisallow: /axj/\nAllow: /')
                    .header('Content-Type', 'text/plain');
            }
        });

        // this local static dir is only used for dev (prod is on CDN)
        server.route({
            method:     'GET',
            path:       '/dist/{path*}',
            handler:    { directory: { path: './dist', listing: false, index: false } }
        });

        // add all the pancakes-based web routes
        pancakes.addWebRoutes({
            server:     server,
            preProcess: mwTasks.isTaskHandled,
            addToModel: mwViewModel.addToModel,
            pageCacheService: pageCacheService
        });

        return new Q(ctx);
    }

    // expose functions
    return {
        init: init
    };
};
