/**
 * Author: Jeff Whelpley
 * Date: 2/25/15
 *
 * Details for social auth login using hapi bell
 */
module.exports = function (Q, _, config, crypto) {

    /**
     * Get the provider info which is really opts from the config plus the
     * profile function which sets the values which we will store in the
     * user table in the database
     *
     * @param providerName
     * @param providerConfig
     * @returns {*}
     */
    function getProvider(providerName, providerConfig) {
        return _.extend({}, providerConfig.opts, {
            profile: function profile(credentials, params, get, callback) {
                var proof = null;

                /* jshint camelcase:false */
                if (providerConfig.useProof) {
                    proof = {
                        appsecret_proof: crypto
                            .createHmac('sha256', this.clientSecret)
                            .update(credentials.token)
                            .digest('hex')
                    };
                }

                get(providerConfig.url, proof, function (profile) {
                    credentials.profile = {
                        authType:           providerName,
                        email:              profile.email,
                        emailLower:         profile.email.toLowerCase(),
                        profileImg:         profile.picture,
                        emailConfirmed:     profile.verified_email,
                        name: {
                            firstName:      profile.given_name || '',
                            lastName:       profile.family_name || '',
                            displayName:    profile.name || ''
                        },
                        authData: {
                            locale:         profile.locale || '',
                            gender:         profile.gender || '',
                            link:           profile.link || '',
                            id:             profile.id || ''
                        }
                    };

                    return callback();
                });
            }
        });
    }

    /**
     * Use the Hapi Bell plugin to register the social auth providers
     * @param ctx
     */
    function init(ctx) {
        var server = ctx.server;

        server.register({ register: require('bell') }, function (err) {
            if (err) { throw err; }

            _.each(config.security.social, function (providerConfig, providerName) {
                var opts = _.extend({}, config.security.cookie, {
                    'cookie':           'bell-' + providerName,
                    'clientId':         providerConfig.appId,
                    'clientSecret':     providerConfig.appSecret,
                    'isSecure':         config.useSSL,
                    'forceHttps':       config.useSSL,
                    'provider':         getProvider(providerName, providerConfig)
                });

                server.auth.strategy(providerName, 'bell', opts);
            });
        });

        return new Q(ctx);
    }

    // exposing functions
    return {
        getProvider: getProvider,
        init: init
    };
};