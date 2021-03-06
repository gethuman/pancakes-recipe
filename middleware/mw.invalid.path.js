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
    var invalidRss = /(\/rss|\/atom)($|\/)/;
    var redirectIcons = /(\.ico$)/;
    var redirectGifs = /(\/images\/.+\.gif$|favicon\.gif$)/;
    var redirectPngs = /(\/images\/.+\.png$|favicon\.png$)/;
    var invalidImages = /^\/(images)\//;
    var invalidCss = /^\/(css)\//;
    var invalidPaths = [
        '/eyeblaster/addineyev2.html',
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
                    return reply().redirect('/').permanent(true);
                }

                if (redirectIcons.test(url)) {
                    return reply().redirect('https://assets.gethuman.com/img/favicon.ico').permanent(true);
                }
                if (redirectGifs.test(url)) {
                    return reply().redirect('https://assets.gethuman.com/img/logo-32.gif').permanent(true);
                }
                if (redirectPngs.test(url)) {
                    return reply().redirect('https://assets.gethuman.com/img/logo-32.png').permanent(true);
                }

                if (invalidRss.test(url) || invalidImages.test(url) || invalidCss.test(url)) {
                    return reply('Invalid path').code(404);
                }

                // invalid if one of the invalid paths
                for (var i = 0; i < invalidPaths.length; i++) {
                    if (url === invalidPaths[i]) {
                        return reply('Invalid path').code(404);
                    }
                }

                if (url.substring(0, 8) === '/cgi-bin') {
                    return reply('Invalid path').code(404);
                }

                if ( /\/search\//.test(url) && url.length > 128 ) { // otherwise we sometimes get a 500 or a 404...?
                    return reply().redirect('/search').permanent(true);
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
                return reply.continue();
            });

            return new Q(ctx);
        }
    };
};

