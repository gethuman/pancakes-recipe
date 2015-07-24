/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 7/11/15
 *
 * Add CLS wrapper around request
 */
module.exports = function (Q, cls) {
    return {
        init: function init(ctx) {
            var ns = cls.createNamespace('appSession');

            ctx.server.ext('onRequest', function (request, reply) {
                ns.bindEmitter(request.raw.req);
                ns.bindEmitter(request.raw.res);
                ns.run(function () { reply.continue(); });
            });

            return new Q(ctx);
        }
    };
};
