/**
 * Author: Jeff Whelpley
 * Date: 3/26/14
 *
 * Connect to mongo and elasticsearch
 */
module.exports = function (Q, _, pancakes, fakeblock, adapters, resources, reactors, config, eventBus, chainPromises, objUtils, log) {

    /**
     * Initialize all the reactors, adapters and services
     * @returns {Q}
     */
    function init(ctx) {
        var container = ctx.container;

        // reactors can be initialized without a promise since just attaching event handlers
        initReactors();

        // adapters and services may be making database calls, so do with promises
        return initAdapters(container)
            .then(function () {
                return initServices(container);
            })
            .then(function () {
                return ctx;
            });
    }

    /**
     * Get handler for a react event
     * @param reactData
     * @returns {Function}
     */
    function reactHandler(reactData) {
        return function (eventData) {
            var deferred = Q.defer();

            // handler should always be run asynchronously
            setTimeout(function () {
                var payload = eventData.payload;
                var inputData = payload.inputData;
                var reactor = reactors[reactData.type + '.reactor'];
                var matchesCriteria = objUtils.matchesCriteria(payload.data, reactData.criteria);
                var fieldMissing = reactData.onFieldChange && reactData.onFieldChange.length &&
                    _.isEmpty(fakeblock.filter.getFieldsFromObj(inputData, reactData.onFieldChange));

                if (!reactor) {
                    log.info('reactHandler does not exist: ' + JSON.stringify(reactData));
                }

                if (!reactor || !matchesCriteria || fieldMissing) {
                    deferred.resolve();
                    return;
                }

                Q.when(reactor.react({
                    caller:         payload.caller,
                    inputData:      inputData,
                    data:           payload.data,
                    context:        payload.context,
                    reactData:      reactData,
                    resourceName:   eventData.name.resource,
                    methodName:     eventData.name.method
                }))
                    .then(function (res) {
                        deferred.resolve(res);
                    })
                    .catch(function (err) {
                        log.error(err);
                        deferred.reject(err);
                    });
            });

            return deferred.promise;
        };
    }

    /**
     * Call all reactor init functions and attach reactors based
     * on reactor data within resource files.
     */
    function initReactors() {

        // loop through each reactor and call init if it exists
        _.each(reactors, function (reactor) {
            if (reactor.init) {
                reactor.init({ config: config, pancakes: pancakes });
            }
        });

        // most reactors will be through the resource reactor definitions
        _.each(resources, function (resource) {                     // loop through all the resources
            _.each(resource.reactors, function (reactData) {        // loop through reactors
                var eventTriggers = {                               // events that will trigger this propgation
                    resources:  [resource.name],
                    adapters:   reactData.trigger.adapters,
                    methods:    reactData.trigger.methods
                };

                // add the event handler
                eventBus.addHandlers(eventTriggers, reactHandler(reactData));
            });
        });
    }

    /**
     * Initialize the adapters as long as the container is no webserver
     *
     * @param container
     * @returns {*}
     */
    function initAdapters(container) {

        var calls = [];

        if (container === 'webserver') {
            _.each(adapters, function (adapter) {
                if (adapter.webInit) {
                    calls.push(adapter.webInit);
                }
            });
        }
        else {
            _.each(adapters, function (adapter) {
                if (adapter.init) {
                    calls.push(adapter.init);
                }
            });
        }

        return chainPromises(calls, config)
            .then(function (config) {
                if (config) {
                    return config;
                }
                else {
                    throw new Error('An adapter in the chain is not returning the config.');
                }
            });
    }

    /**
     * Call a promise chain of service init functions ONLY for those
     * that are NOT used for the current container or if there is
     * not init() method or if the current adapter is apiclient
     *
     * @param container
     */
    function initServices(container) {
        var calls = [];
        _.each(resources, function (resource) {
            if (!resource || !resource.adapters) { return; }

            var adapter = resource.adapters[container];

            if (adapter && adapter !== 'apiclient') {
                var service = pancakes.getService(resource.name);
                if (service.init) {
                    calls.push(service.init.bind(service));
                }
            }
        });

        return chainPromises(calls, null);
    }

    // expose functions
    return {
        init: init,
        initAdapters: initAdapters,
        initServices: initServices,
        initReactors: initReactors,
        reactHandler: reactHandler
    };
};