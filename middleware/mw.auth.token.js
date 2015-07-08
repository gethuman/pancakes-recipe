/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 2/25/15
 *
 * This middleware will
 */
module.exports = function (Q, userService, userCacheService, config, jwt, log) {
    var privateKey = config.security && config.security.token && config.security.token.privateKey;

    /**
     * Get a user for a particular token
     * @param decodedToken
     * @returns {*}
     */
    function getUserForToken(decodedToken) {
        var userId = decodedToken._id;
        var authToken = decodedToken.authToken;
        var cacheKey = userId + authToken;
        var conditions = {
            caller: userService.admin,
            where: { _id: userId, authToken: authToken },
            findOne: true
        };
        var cachedUser;

        // if no user id or authToken, then no user
        if (!userId || !authToken) { return null; }

        // try to get user from cache, then DB
        return userCacheService.get({ key: cacheKey })
            .then(function (user) {
                cachedUser = user;
                return user ? user : userService.find(conditions);
            })
            .then(function (user) {

                // if user found in database, but not in cache, save in cache
                if (user && !cachedUser) {
                    userCacheService.set({ key: cacheKey, value: user });
                }

                // return the user
                return user;
            });
    }

    /**
     * Attempt to find a user for a given token. There will be an error if the
     * Authorization header is invalid, but if it doesn't exist or the user
     * can't be found, no error because we let Fakeblock ACLs determine whether
     * transaction can be anonymous.
     *
     * @param req
     * @param reply
     */
    function validateToken(req, reply) {
        var authorization = req.headers.authorization;
        if (!authorization) {
            return reply.continue();
        }

        // this is hack fix so that localStorage and cookies can either have Bearer or not
        // if in local storate, it is serialized, so need to replace %20 with space
        // need to fix this in the future at the source (i.e. on the client side)
        authorization = authorization.replace('Bearer%20', 'Bearer ');
        if (!authorization.match(/^Bearer /)) {
            authorization = 'Bearer ' + authorization;
        }

        var parts = authorization.split(/\s+/);

        if (parts.length !== 2) {
            throw new Error('Authorization header invalid');
        }

        if (parts[0].toLowerCase() !== 'bearer') {
            throw new Error('Authorization no bearer');
        }

        if (parts[1].split('.').length !== 3) {
            throw new Error('Authorization bearer value invalid');
        }

        var token = parts[1];
        jwt.verify(token, privateKey)
            .then(function (decodedToken) {
                return getUserForToken(decodedToken);
            })
            .then(function (user) {
                req.user = user;
                reply.continue();
            })
            // if error, then log it, but continue on as anonymous
            .catch(function () {
                log.error('Problem verifying token: ' + token);
                reply.continue();
            });
    }


    /**
     * Register the hapi auth strategy
     * @param ctx
     */
    function init(ctx) {
        var server = ctx.server;

        if (!privateKey) {
            throw new Error('Please set config.security.token.privateKey');
        }

        server.ext('onPreAuth', validateToken);

        return new Q(ctx);
    }

    // exposing functions
    return {
        getUserForToken: getUserForToken,
        validateToken: validateToken,
        init: init
    };
};
