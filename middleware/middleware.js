/**
 * Author: Jeff Whelpley
 * Date: 1/26/14
 *
 * This module contain the primary server container code for both the API
 * and the web server.
 */
module.exports = function (pancakes, chainPromises) {

    // this contains the list of middleware (in order) for each container
    var mwConfig = {
        api:        ['mwErrorHandling', 'mwServiceInit', 'mwAuthToken', 'mwCaller', 'mwApiRoutes'],
        webserver:  ['mwErrorHandling', 'mwServiceInit', 'mwAuthSocial', 'mwAuthCookie',
                        'mwAuthToken', 'mwCaller', 'mwTasks', 'mwAppContext', 'mwWebRoutes', 'mwTracking']
    };

    /**
     * Initialize the server and middleware and then start the server
     */
    function init(ctx) {
        var calls = mwConfig[ctx.container].map(function (name) {
            var mw = pancakes.cook(name);
            return mw.init;
            //return function (ctx) {
            //    console.log('calling init for ' + name);
            //    return mw.init(ctx);
            //};
        });

        // execute all the calls
        return chainPromises(calls, ctx);
    }

    return {
        init: init
    };
};
