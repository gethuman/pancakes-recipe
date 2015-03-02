/**
 * Author: Jeff Whelpley
 * Date: 2/27/15
 *
 * Convenience wrapper around jsonwebtoken
 */
module.exports = function (Q, jsonwebtoken, config) {

    /**
     * Simple function to generate a JWT based off a user
     * @param user
     * @returns {*}
     */
    function generateForUser(user) {
        var privateKey = config.security.token.privateKey;
        var decryptedToken = { _id: user._id, authToken: user.authToken };
        return jsonwebtoken.sign(decryptedToken, privateKey);
    }

    /**
     * Wrapper around jsonwebtoken.verify to add promises. Also, if no token it
     * doesn't fail. Just doesn't return a user.
     *
     * @param token
     * @param privateKey
     * @param getUserForTokenFn
     * @returns {*}
     */
    function veryifyAndGetUser(token, privateKey, getUserForTokenFn) {
        var deferred = Q.defer();

        // no token so return nothing
        if (!token) {
            return new Q();
        }

        jsonwebtoken.verify(token, privateKey, function (err, decodedToken) {
            if (err) { deferred.reject(err); }

            // no decoded token so return nothing
            if (!decodedToken) {
                deferred.resolve();
                return;
            }

            getUserForTokenFn(decodedToken)
                .then(function (user) {
                    deferred.resolve(user);
                })
                .catch(function (error) {
                    deferred.reject(error);
                });
        });

        return deferred.promise;
    }

    // exposed functions
    return {
        generateForUser: generateForUser,
        veryifyAndGetUser: veryifyAndGetUser
    };
};
