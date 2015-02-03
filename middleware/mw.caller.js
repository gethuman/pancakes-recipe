/**
 * Author: Jeff Whelpley
 * Date: 4/28/14
 *
 * Getting the caller
 */
module.exports = function (Q, funnelweb, crypto, userService, visitorService,
                           mongoose, config, log, AppError, cls) {

    //var isRobot = funnelweb;    // better name for lib used to detect robots
    var partnerCache = {};      // partners don't change often, so just store them statically

    /**
     *
     * Check the tracking cookie. If exists don't do anything. If it doesn't,
     * create a new one and send a cookie back to the user in the response.
     *
     * @param req
     */
    function visitorInit(req) {

        // if visitor ID already exists, we are all set, so just return
        if (req.session && req.session.get('visitorId')) { return; }

        //var headers = req.headers || {};
        //var userAgent = headers['user-agent'] || '';

        // no visitor info in session, so create a new visitor
        var id = (new mongoose.Types.ObjectId()) + '';  // coerce to a string
        if (req.session) { req.session.set('visitorId', id); }

        // we want to force async so processes occurs without stopping to check user agent
        //setTimeout(function () {
        //    if (isRobot(userAgent)) { return; }     // robots are not tracked as visitors
        //
        //    visitorService.create({
        //        caller: visitorService.admin,
        //        data:   { _id: id }                 // ips: [ req.info.remoteAddress ], headers: req.headers
        //    })
        //        .then(function (data) {
        //            log.debug('Visitor info saved for ' + data._id, null);
        //        })
        //        .catch(function (err) {
        //            log.error(err, null);
        //        });
        //}, 1);
    }

    /**
     * Get user from the request data
     * @param req
     */
    function getUser(req) {

        // if user already set, then return it
        if (req.user) { return new Q(req.user); }

        /* jshint camelcase:false */
        // if passport didn't already attach user, only other possibility is a parter
        var partnerId       = req.headers['x-partner-id'];
        var partnerSecret   = req.headers['x-partner-secret'];

        if (!partnerId || !partnerSecret) { return new Q(); }   // no partner ID or secret, then no user

        // use the value in cache if we have it
        var cachedPartner = partnerCache[partnerId];
        if (cachedPartner && cachedPartner.secret === partnerSecret) {
            return new Q(cachedPartner);
        }

        // else get the partner from the database
        var deferred = Q.defer();
        userService.find({ caller: userService.admin, where: { authToken: partnerId }, findOne: true })
            .then(function (partner) {
                partnerCache[partnerId] = partner;

                if (partnerSecret === partner.secret) {
                    deferred.resolve(partner);
                }
                else {
                    deferred.reject(new AppError({
                        code: 'invalid_credentials',
                        msg: 'Partner ' + partnerId + ' tried to auth with secret ' + partnerSecret
                    }));
                }
            })
            .catch(function (err) {
                deferred.reject(new AppError({ code: 'invalid_credentials', err: err }));
            });

        return deferred.promise;
    }

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
        var shasum = crypto.createHash('md5').update(deviceId + config.security.deviceHashSalt);
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
        var visitorId = req.session && req.session.get('visitorId');
        var ipAddress = req.info.remoteAddress;

        if (req.user) {

            // if user admin and there is an onBehalfOf value then use onBehalfOf
            if (req.user.role === 'admin' && req.query.onBehalfOfId) {
                return {
                    _id:    req.query.onBehalfOfId,
                    name:   req.query.onBehalfOfName,
                    role:   req.query.onBehalfOfRole,
                    type:   req.query.onBehalfOfType,
                    visitorId: req.query.onBehalfOfVisitorId,
                    ipAddress: ipAddress
                };
            }

            // else return user data as caller info
            return {
                _id:    req.user._id,
                name:   req.user.username,
                role:   req.user.role,
                type:   'user',
                user:   req.user,
                visitorId: visitorId,
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
        else if (visitorId) {
            return {
                _id:    visitorId,
                name:   'anonymous',
                role:   'visitor',
                type:   'visitor',
                visitorId: visitorId,
                ipAddress: ipAddress
            };
        }
        // if no other auth, but GET then defer to fakeblock ACL level security
        else if (req.method === 'get' || req.method === 'options') {
            return {
                _id:    'unknown',
                name:   'unknown',
                role:   'unknown',
                type:   'unknown',
                ipAddress: ipAddress
            };
        }
        else { return null; }
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

            // only if we are on the webserver, initialize the visitor
            if (container === 'webserver') { visitorInit(req); }

            // get potential information about the caller
            getUser(req)
                .then(function (user) {
                    req.user = user;
                    req.deviceId = getDeviceId(req);
                    req.caller = getCaller(req);

                    if (container === 'webserver') {
                        var session = cls.getNamespace('appSession');
                        if (session) { session.set('caller', req.caller); }
                    }

                    req.caller ? reply.continue() : reply(new AppError({
                        code: 'invalid_credentials',
                        msg: 'caller not found'
                    }));
                })
                .catch(function (err) {
                    reply(err);
                });
        });

        return new Q(ctx);
    }

    // exposing functions
    return {
        visitorInit: visitorInit,
        getUser: getUser,
        getDeviceId: getDeviceId,
        getCaller: getCaller,
        init: init
    };
};
