/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 7/24/15
 *
 * Short curcuit invalid paths up front
 */
module.exports = function (Q) {
    var invalidSuffixes = /(\.php|\.asp|\.cgi|\.aspx|\/rss)$/;
    var invalidPrefixes = /^\/(cgi-bin|images|css)\//;
    var invalidPaths = [
        '/crossdomain.xml',
        '/browserconfig.xml',
        '/favicon.gif',
        '/urlEmail',
        '/atom.xml',
        '/change.html',
        '/atom',
        '/match'
    ];

    return {
        init: function init(ctx) {
            ctx.server.ext('onRequest', function (request, reply) {
                var url = request.url.pathname.toLowerCase();

                // 404 if ends with php, asp, aspx
                if (invalidPrefixes.test(url) || invalidSuffixes.test(url)) {
                    reply('Invalid path').code(404);
                    return;
                }

                // invalid if one of the invalid paths
                for (var i = 0; i < invalidPaths.length; i++) {
                    if (url === invalidPaths[i]) {
                        reply('Invalid path').code(404);
                        return;
                    }
                }

                if (url.substring(0, 8) === '/cgi-bin') {
                    reply('Invalid path').code(404);
                    return;
                }

                // if we get here, we can continue as normal
                reply.continue();
            });

            return new Q(ctx);
        }
    };
};

