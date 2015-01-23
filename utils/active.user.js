/**
 * Copyright 2013 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 4/25/14
 *
 * The purpose of this singleton is to allow any client side code to easily inject
 * the information about the active user
 */
module.exports = {

    // on the server side, we attempt to get the user from the CLS session
    // NOTE: this is not 100% fullproof, so only use for non-critical situations
    server: function (Q, cls) {
        return {
            init: function () {
                var session = cls.getNamespace('appSession');
                if (session) {
                    var caller = session.get('caller');
                    if (caller) {
                        return new Q(caller.user);
                    }
                }

                return new Q({});
            }
        };
    },

    // the client maintains the active user in memory
    client: function ($timeout, _, Q, userService, log, eventBus) {

        var user = { initComplete: false };

        /**
         * Set user input into local values
         * @param me
         */
        function setUserLocal(me) {

            // if nothing returned log an error and return
            if (!me) { log.error('No user info found', null); return null; }

            // otherwise, pull out the user
            _.extend(user, me.user, { visitorId: me.visitorId });

            // return the user and notify init complete
            user.initComplete = true;
            eventBus.emit('user.init');
            return user;
        }

        /**
         * Get the user from the back end
         * @returns {*} The user object
         */
        function getUser() {
            return userService.findMe().then(setUserLocal);
        }

        /**
         * If user already loaded, use that, otherwise get it from the API
         * @returns {*}
         */
        user.init = function init() {
            if (user.visitorId) {
                return Q.when(user);
            }
            else {
                return getUser();
            }
        };

        /**
         * Update the active user (i.e. during login/logout/etc.)
         * @param updatedUser
         */
        user.reinit = function reinit(updatedUser) {
            _.each(user, function reset(val, key) {
                if (!_.isFunction(val) && key !== 'visitorId' && key !== 'initComplete') {
                    user[key] = null;
                }
            });

            _.extend(user, updatedUser);

            eventBus.emit('user.init');
        };

        // return the user as a singleton from this module
        return user;
    }
};