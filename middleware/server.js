/**
 * Author: Jeff Whelpley
 * Date: 1/26/14
 *
 * This module contain the primary server container code for both the API
 * and the web server.
 */
module.exports = function (pancakes, chainPromises, config, Hapi, log) {
    /* eslint no-process-env:0 */
    /* eslint no-console:0 */

    // this contains the list of middleware (in order) for each container
    var mwConfig = {
        api:        ['mwErrorHandling', 'mwServiceInit', 'mwAuthToken', 'mwCaller', 'mwApiRoutes'],
        webserver:  ['mwCls', 'mwSsl', 'mwErrorHandling', 'mwServiceInit', 'mwAuthSocial', 'mwAuthCookie',
                        'mwAuthToken', 'mwCaller', 'mwTasks', 'mwAppContext', 'mwWebRoutes', 'mwTracking']
    };

    return {
        start: function start(container) {

            // create the Hapi server
            var server = new Hapi.Server();
            var port = process.env.PORT || config[container].port;
            server.connection({ port: port });

            // create context that is passed into each middleware
            var ctx = {
                container:  container,
                server:     server
            };

            // create array of all the middleware for the current container
            var middleware = mwConfig[ctx.container].map(function (name) {
                var mw = pancakes.cook(name);
                return mw.init;
            });

            console.log('starting server...');

            // execute all the middleware
            return chainPromises(middleware, ctx)
                .then(function () {

                    // now that middleware initialized, start the server
                    server.start(function (err) {
                        err ?
                            log.error(err) :
                            log.info(container + ' started at: ' + server.info.uri);
                    });
                }).done();
        }
    };
};
