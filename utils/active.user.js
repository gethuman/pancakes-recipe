/**
 * Copyright 2013 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 4/25/14
 *
 * The purpose of this singleton is to allow any client side code to easily inject
 * the information about the active user
 */
module.exports = function ($timeout, _, Q, userService, log, eventBus, storage) {
    // @module({ "client": true, "server": false })

    var user = { initComplete: false };

    /**
     * If user already loaded, use that, otherwise get it from the API
     * @returns {*}
     */
    function init() {
        return user.initComplete ?
            Q.when(user) :
            userService.findMe()
                .then(function setUserLocal(me) {
                    me = me || {};

                    // pull out the user
                    _.extend(user, me.user);

                    // return the user and notify init complete
                    user.initComplete = true;
                    eventBus.emit('user.init');

                    return user;
                });
    }

    /**
     * Remove user vals from the user object (for logout or before changing user)
     * All values are removed from user except functions and initComplete
     */
    function removeUserVals() {
        _.each(user, function reset(val, key) {
            if (!_.isFunction(val) && key !== 'initComplete') {
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
        storage.set('jwt', 'Bearer ' + jwt);    // set the token in local storage
        removeUserVals();                       // remove old user values
        _.extend(user, updatedUser);            // add new user values
        eventBus.emit('user.init');             // let everyone else know there is a new user in town
    }

    /**
     * Log the active user out
     */
    function logout() {
        removeUserVals();                       // remove user vals to log out
        storage.remove('jwt');                  // then remove the JSON web token from local storage
        eventBus.emit('user.init');             // let everyone else know user logged out
    }

    // add functions to user
    _.extend(user, {
        init:   init,
        login:  login,
        logout: logout
    });

    // return the user as a singleton from this module
    return user;
};