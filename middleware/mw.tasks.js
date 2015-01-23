/**
 * Author: Jeff Whelpley
 * Date: 10/19/14
 *
 *
 */
module.exports = function (_, Q, pancakes, resources, log, routeHelper) {
    var taskHandlers = {};

    /**
     * Initialize a local variable that holds the config values for the task
     * handlers
     * @param ctx
     */
    function init(ctx) {
        _.each(resources, function (resource) {
            _.each(resource.tasks, function (taskInfo, taskName) {
                taskInfo.name = taskName;
                taskInfo.service = pancakes.getService(resource.name);
                taskHandlers[taskName] = taskInfo;
            });
        });

        return new Q(ctx);
    }

    /**
     * Handle one particular task
     * @param request
     * @param reply
     */
    function isTaskHandled(request, reply) {
        var taskName = request.query.task;

        // if no task or task handler, don't do anything
        if (!taskName && !taskHandlers[taskName]) { return false; }

        // if task info doesn't have service or method, don't do anything
        var taskInfo = taskHandlers[taskName];
        if (!taskInfo || !taskInfo.service || !taskInfo.method || !taskInfo.service[taskInfo.method]) {
            return false;
        }

        // if user is not logged in redirect to login then back to here
        if (!request.caller || !request.caller.user) {
            reply().redirect(routeHelper.getLoginUrl(request.url.pathname));
            return true;
        }

        // start collecting the service request
        var serviceReq = { caller: request.caller };

        // get the values from the request object to put into the service request
        _.each(taskInfo.params, function (param) {
            if (request.query[param]) {
                serviceReq[param] = request.query[param];
            }
        });

        // call the service method
        taskInfo.service[taskInfo.method](serviceReq)
            .then(function () {
                reply().redirect(request.path + '?notify=' + taskInfo.notifySuccess);
            })
            .catch(function (err) {
                log.error(err);
                reply().redirect(request.path + '?notify=' + taskInfo.notifyFailure);
            });

        return true;
    }

    // expose functions
    return {
        init: init,
        isTaskHandled: isTaskHandled
    };
};
