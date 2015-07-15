/**
 * Author: Jeff Whelpley
 * Date: 4/6/14
 *
 * Tracking middleware
 */
module.exports = function (Q, config) {
    return {
        init: function init(ctx) {
            ctx.server.ext('onPreAuth', function (req, reply) {
                if (req.query.fromurl && req.session) {
                    req.session.set('lastPage', req.query.fromurl);
                }

                reply.continue();
            });

            ctx.server.ext('onPostHandler', function (req, reply) {
                var url = req.url.pathname;
                var domain = req.app.domain;
                var isNotStaticFile = url.indexOf(config.staticFiles.assets) < 0;

                if (domain !== 'trust' && url !== '/ping' && url !== '/robots.txt' && isNotStaticFile && req.session) {
                    req.session.set('lastPage', req.info.host + url);
                }

                reply.continue();
            });

            return new Q(ctx);
        }
    };
};
