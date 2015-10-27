/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 7/24/15
 *
 * Short curcuit invalid paths up front
 */
module.exports = function (Q) {
    var invalidSuffixes = /(\.php|\.cgi|\.aspx|\.asp)$/;
    var invalidPrefixes = /^\/(cgi-bin|wp|wp-admin|wp-content|wp-include|wp-includes|wordpress)\//;
    var deprecatedPrefixes = /^\/(video)\//;
    var invalidRss = /(\/rss|\/atom)/;
    var invalidImages = /^\/(images)\//;
    var invalidCss = /^\/(css)\//;
    var invalidPaths = [
        '/crossdomain.xml',
        '/favicon.gif',
        '/atom.xml',
        '/match'
    ];

    return {
        init: function init(ctx) {
            ctx.server.ext('onRequest', function (request, reply) {
                var url = request.url.pathname.toLowerCase();

                // 404 if ends with php, asp, aspx
                if (invalidPrefixes.test(url) || invalidSuffixes.test(url) || deprecatedPrefixes.test(url)) {
                    // or... we could just redirect to home page... why not?
                    //reply('Invalid path').code(404);
                    reply().redirect('/').permanent(true);
                    return;
                }

                if (invalidRss.test(url) || invalidImages.test(url) || invalidCss.test(url)) {
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
                    return reply('Invalid path').code(404);
                }

                // todo: ask Jeff how to get these back to gh- don't belong here...
                if (/\/problemsUrl$/i.test(url)) {
                    return reply().redirect('https://problems.gethuman.com').permanent(true);
                }
                if (/\/answersUrl$/i.test(url)) {
                    return reply().redirect('https://answers.gethuman.com').permanent(true);
                }
                if (/\/reviewsUrl$/i.test(url)) {
                    return reply().redirect('https://reviews.gethuman.com').permanent(true);
                }
                if (/\/myUrl$/i.test(url)) {
                    return reply().redirect('https://my.gethuman.com').permanent(true);
                }
                if (/\/iUrlTeam$/i.test(url)) {
                    return reply().redirect('https://i.gethuman.com/team').permanent(true);
                }
                if (/\/iUrlLegal$/i.test(url)) {
                    return reply().redirect('https://i.gethuman.com/legal').permanent(true);
                }

                // if we get here, we can continue as normal
                reply.continue();
            });

            return new Q(ctx);
        }
    };
};

