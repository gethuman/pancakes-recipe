/**
 * Author: Jeff Whelpley
 * Date: 1/18/15
 *
 * Get route info (usually overwritten by pancakes project)
 */
module.exports = function () {
    // @module({ "client": true })

    /**
     * Used for doing redirects to the login page/modal
     * @param currentUrl
     * @returns {string}
     */
    function getLoginUrl(currentUrl) {
        return currentUrl + '?modal=auth&submodal=login&redirect=' + currentUrl;
    }

    // exposed functions
    return {
        getLoginUrl: getLoginUrl
    };
};
