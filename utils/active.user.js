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
    client: function ($timeout, _, Q, userService, log, eventBus, storage) {

        var user = { initComplete: false };

        /**
         * If user already loaded, use that, otherwise get it from the API
         * @returns {*}
         */
        function init() {
            return user.visitorId ?
                Q.when(user) :
                userService.findMe()
                    .then(function setUserLocal(me) {
                        me = me || {};

                        // if nothing returned log an error and return
                        //if (!me) { log.error('No user info found', null); return null; }

                        // save the visitor Id in storage for use by ajax
                        storage.set('visitorId', me.visitorId);

                        // otherwise, pull out the user
                        _.extend(user, me.user, { visitorId: me.visitorId });

                        // return the user and notify init complete
                        user.initComplete = true;
                        eventBus.emit('user.init');

                        return user;
                    });
        }

        /**
         * Remove user vals from the user object (for logout or before changing user)
         * All values are removed from user except functions, visitorId and initComplete
         */
        function removeUserVals() {
            _.each(user, function reset(val, key) {
                if (!_.isFunction(val) && key !== 'visitorId' && key !== 'initComplete') {
                    user[key] = null;
                }
            });
        }

        /**
         * Update the active user (i.e. during login/logout/etc.)
         * @param updatedUser
         * @param jwt
         */
        function login(updatedUser, jwt) {
            storage.set('jwt', jwt);        // set the token in local storage
            removeUserVals();               // remove old user values
            _.extend(user, updatedUser);    // add new user values
            eventBus.emit('user.init');     // let everyone else know there is a new user in town
        }

        /**
         * Log the active user out
         */
        function logout() {
            removeUserVals();               // remove user vals to log out
            storage.remove('jwt');          // then remove the JSON web token from local storage
            eventBus.emit('user.init');     // let everyone else know user logged out
        }

        // add functions to user
        _.extend(user, {
            init: init,
            login: login,
            logout: logout
        });

        // return the user as a singleton from this module
        return user;
    }
};