/**
 * Author: Jeff Whelpley
 * Date: 2/27/15
 *
 * Convenience wrapper around jsonwebtoken
 */
module.exports = function (_, Q, jsonwebtoken, config) {

    /**
     * Simple function to generate a JWT based off a user
     * @param user
     * @param existingToken Optional, pass in if there is an existing token we are adding to
     * @returns {*}
     */
    function generateForUser(user, existingToken) {
        existingToken = existingToken || {};

        var privateKey = config.security.token.privateKey;
        var decryptedToken = _.extend(existingToken, { _id: user._id, authToken: user.authToken });

        return jsonwebtoken.sign(decryptedToken, privateKey);
    }

    /**
     * Simple promise based wrapper around jsonwebtoken verify()
     * @param token
     * @param privateKey
     * @param audience
     * @returns {*}
     */
    function verify(token, privateKey, audience) {
        var deferred = Q.defer();
        var options = { ignoreExpiration: true, audience: audience };

        // no token so return nothing
        if (!token) {
            return new Q();
        }

        jsonwebtoken.verify(token, privateKey, options, function (err, decodedToken) {
            err ? deferred.reject(err) : deferred.resolve(decodedToken);
        });

        return deferred.promise;
    }

    // exposed functions
    return {
        generateForUser: generateForUser,
        verify: verify
    };
};
