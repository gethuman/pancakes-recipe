/**
 * Author: Jeff Whelpley
 * Date: 4/6/14
 *
 * Tracking middleware
 */
module.exports = function (Q, config, trackingService, log) {
    return {
        init: function init(ctx) {
            var isWebserver = ctx.container === 'webserver';
            var isApi = ctx.container === 'api';

            if (isWebserver) {
                ctx.server.ext('onPreAuth', function (req, reply) {
                    if (req.query.fromurl && req.session) {
                        req.yar.set('lastPage', req.query.fromurl);
                    }

                    reply.continue();
                });
            }

            ctx.server.ext('onPostHandler', function (req, reply) {
                var url = req.url.pathname;
                var domain = req.app.domain;
                var isNotStaticFile = url.indexOf(config.staticFiles.assets) < 0;

                if (isWebserver && domain !== 'trust' && url !== '/ping' && url !== '/robots.txt' && isNotStaticFile && req.session) {
                    req.yar.set('lastPage', req.info.host + url);
                }
                else if (isApi) {
                    trackingService.trackApiCall({
                        caller:     req.caller,
                        host:       req.info.host,
                        method:     req.method,
                        url:        url
                    })
                        .catch(function (err) {
                            log.error(err);
                        });
                }

                reply.continue();
            });

            return new Q(ctx);
        }
    };
};
