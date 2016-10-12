/**
 * Author: Jeff Whelpley
 * Date: 4/28/14
 *
 * Getting the caller
 */
module.exports = function (Q, crypto, userService, config, log, AppError, cls) {

    /**
     * Get the device id if it exists and the secret is valid
     * @param req
     * @returns {string}
     */
    function getDeviceId(req) {

        // NOTE: client_id and client_secret are deprecated so eventually remove
        var deviceId = req.headers['x-device-id'];
        var deviceSecret = req.headers['x-device-secret'];

        // if client ID and secret don't exist, then no device
        if (!deviceId || !deviceSecret) { return null; }

        // else we have a device, so check the sha hash
        var shasum = crypto.createHash('md5').update(deviceId + config.security.device.salt);
        var digest = shasum.digest('hex');

        // if the digest is not the same as the secret, request is unauthorized
        if (digest !== deviceSecret) {
            log.error('Invalid device ' + deviceId + ' with secret ' + deviceSecret, null);
            return null;
        }
        // else the device is valid, so set it and move on
        else {
            return deviceId;
        }
    }

    /**
     * Get the caller based on the request
     * @param req
     * @returns {*}
     */
    function getCaller(req) {
        var ipAddress = req.headers['x-forwarded-for'] || req.info.remoteAddress || '';
        var user = req.user;

        if (user) {

            // if user admin and there is an onBehalfOf value then use onBehalfOf
            if (user.role === 'admin' && req.query.onBehalfOfId) {
                return {
                    _id:    req.query.onBehalfOfId,
                    name:   req.query.onBehalfOfName,
                    role:   req.query.onBehalfOfRole,
                    type:   req.query.onBehalfOfType,
                    ipAddress: ipAddress
                };
            }

            // else return user data as caller info
            return {
                _id:    user._id,
                name:   user.username,
                role:   user.role,
                type:   'user',
                user:   user,
                ipAddress: ipAddress
            };

        }
        else if (req.deviceId) {
            return {
                _id:    req.deviceId,
                name:   req.deviceId,
                role:   'device',
                type:   'device',
                ipAddress: ipAddress
            };
        }
        // if no other auth, but GET then defer to fakeblock ACL level security
        //else if (req.method === 'get' || req.method === 'options') {
        else {
            return {
                _id:    'unknown',
                name:   'unknown',
                role:   'visitor',
                type:   'visitor',
                ipAddress: ipAddress
            };
        }
    }

    /**
     * Initialize the caller
     * @param ctx
     */
    function init(ctx) {
        var server = ctx.server;
        var container = ctx.container;

        server.ext('onPreHandler', function (req, reply) {

            // if request for a static file, return right away
            if (req.url.path.indexOf(config.staticFiles.assets) > -1) { reply.continue(); return; }

            // get potential information about the caller
            req.deviceId = getDeviceId(req);
            req.caller = getCaller(req);

            if (container === 'webserver') {
                var session = cls.getNamespace('appSession');
                if (session && session.active) {
                    session.set('caller', req.caller);
                }
            }

            req.caller ?
                reply.continue() :
                reply(new AppError({
                    code: 'invalid_credentials',
                    msg: 'caller not found'
                }));
        });

        return new Q(ctx);
    }

    // exposing functions
    return {
        getDeviceId: getDeviceId,
        getCaller: getCaller,
        init: init
    };
};
