/**
 * Author: Jeff Whelpley
 * Date: 4/28/14
 *
 * All passport related functionality
 */
module.exports = function (Q, _, crypto, userService, lruCache, config) {
    var oneYear = 365 * 24 * 60 * 60 * 1000;

    // create a 60 second in-memory cache for user info just so that it is not hit multiple times per request
    var userCache = lruCache({ max: 1000, maxAge: 60000 });

    // we will use the same cookie config values for both the session and the social auth
    var cookieConfig = {
        ttl:        oneYear,
        domain:     config.cookieDomain,
        password:   config.sessionSecret,
        isSecure:   false
    };

    /* jshint camelcase:false */

    /**
     * Register Google and Facebook
     * @param server
     */
    function registerSocialProviders(server) {

        // bell used for the auth session values
        server.register({ register: require('bell') }, function (err) {
            if (err) { throw err; }

            server.auth.strategy('facebook', 'bell', _.extend({
                cookie:         'bell-facebook',
                clientId:       config.security.facebookAppId,
                clientSecret:   config.security.facebookAppSecret,
                //provider:       'facebook'
                provider: {
                    protocol:   'oauth2',
                    auth:       'https://graph.facebook.com/oauth/authorize',
                    token:      'https://graph.facebook.com/oauth/access_token',
                    scope:      ['email'],
                    scopeSeparator: ',',
                    profile: function (credentials, params, get, callback) {
                        var query = {
                            appsecret_proof: crypto
                                .createHmac('sha256', this.clientSecret)
                                .update(credentials.token)
                                .digest('hex')
                        };

                        get('https://graph.facebook.com/me', query, function (profile) {
                            credentials.profile = {
                                authType:           'facebook',
                                email:              profile.email,
                                emailLower:         profile.email.toLowerCase(),
                                //profileImg:         profile.picture,
                                //emailConfirmed:     profile.verified_email,
                                name: {
                                    firstName:      profile.first_name,
                                    lastName:       profile.last_name,
                                    middleName:     profile.middle_name,
                                    displayName:    profile.name
                                },
                                authData: {
                                    id:             profile.id,
                                    username:       profile.username
                                }
                            };

                            return callback();
                        });
                    }
                }
            }, cookieConfig));

            server.auth.strategy('google', 'bell', _.extend({
                cookie:         'bell-google',
                clientId:       config.security.googleAppId,
                clientSecret:   config.security.googleAppSecret,
                provider: {
                    protocol:   'oauth2',
                    auth:       'https://accounts.google.com/o/oauth2/auth',
                    token:      'https://accounts.google.com/o/oauth2/token',
                    scope:      ['email', 'profile'],
                    profile: function (credentials, params, get, callback) {
                        get('https://www.googleapis.com/oauth2/v1/userinfo', null, function (profile) {

                            credentials.profile = {
                                authType:           'google',
                                email:              profile.email,
                                emailLower:         profile.email.toLowerCase(),
                                profileImg:         profile.picture,
                                emailConfirmed:     profile.verified_email,
                                name: {
                                    firstName:      profile.given_name,
                                    lastName:       profile.family_name,
                                    displayName:    profile.name
                                },
                                authData: {
                                    locale:         profile.locale,
                                    gender:         profile.gender,
                                    link:           profile.link,
                                    id:             profile.id
                                }
                            };

                            return callback();
                        });
                    }
                }
            }, cookieConfig));
        });
    }

    /**
     * Create the auth cookie used to hold credentials
     * @param server
     */
    function initializeSession(server) {

        // this used to hold the auth stuff in the cookie
        server.register({ register: require('hapi-auth-cookie') }, function (err) {
            if (err) { throw err; }

            server.auth.strategy('session', 'cookie', cookieConfig);
            //server.auth.default('session');
        });

        // yar session used to hold the visitorId
        server.register({
            register: require('yar'),
            options: {
                cache: {
                    expiresIn:  oneYear
                },
                cookieOptions: {
                    domain:     config.cookieDomain,
                    password:   config.sessionSecret,
                    isSecure:   false
                }
            }
        }, function (err) {
            if (err) { throw err; }
        });
    }

    /**
     * Deserialize the authenticated user out of the session
     * @param req
     * @param reply
     */
    function deserializeUser(req, reply) {
        //var _id = req.auth.credentials && req.auth.credentials._id;
        var _id = req.session && req.session.get('userId');

        // if no id, return without doing anything
        if (!_id) { reply.continue(); return; }

        // if user in the cache, just return that
        var cachedUser = userCache.get(_id + '');

        if (cachedUser) {
            req.user = cachedUser;
            reply.continue();
            return;
        }

        // otherwise get the user from the database
        userService.findById({ caller: userService.admin, _id: _id })
            .then(function (user) {
                if (user) {
                    userCache.set(_id + '', user);
                    req.user = user;
                }

                reply.continue();
            })
            .catch(function (err) {
                reply(err);
            }
        );
    }

    /**
     * Initialize the security based plugins and session values
     * @param ctx
     */
    function init(ctx) {
        var server = ctx.server;

        if (ctx.container === 'webserver') {
            registerSocialProviders(server);            // register google and facebook providers for web server
        }

        initializeSession(server);                      // make sure cookie set up to hold auth values
        server.ext('onPreHandler', deserializeUser);    // if auth user in cookie, get full user

        return new Q(ctx);
    }

    // exposing functions
    return {
        initializeSession: initializeSession,
        registerSocialProviders: registerSocialProviders,
        deserializeUser: deserializeUser,
        init: init
    };
};
