/**
 * Author: Jeff Whelpley
 * Date: 2/18/14
 *
 * A simple adapter to call out to API from another node process
 */
var Q               = require('q');
var _               = require('lodash');
var request         = require('request');
var jsonwebtoken    = require('jsonwebtoken');
var cls             = require('continuation-local-storage');
var mongo           = require('pancakes-mongo');
var admin = {}, baseUrl, headers;

/**
 * Initialize the methods for this interface using the resource. This will
 * loop through the routes defined in the api section of the resource file
 * and auto generate method interfaces which all end up make REST API calls.
 *
 * @param resource
 * @constructor
 */
function ApiclientAdapter(resource) {
    this.admin = admin;
    this.resource = resource || {};

    // loop through API interface for resource to get methods to expose
    var me = this;
    _.each(resource.api, function (methodInfo, httpMethod) {
        _.each(methodInfo, function (operation, path) {
            me[operation] = function (req) {
                return me.send(httpMethod, path, req);
            };
        });
    });
}

/**
 * Init called at startup and is used to
 * @param config
 */
function init(config) {
    var tokenConfig = config.security.token || {};
    var privateKey = tokenConfig.privateKey;
    var decryptedToken = {
        _id: tokenConfig.webserverId,
        authToken: tokenConfig.webserverToken
    };
    var jwt = jsonwebtoken.sign(decryptedToken, privateKey);

    headers = { 'Authorization': 'Bearer ' + jwt };

    admin._id =  mongo.newObjectId('000000000000000000000000');
    admin.name = 'systemAdmin';
    admin.type = 'user';
    admin.role = 'admin';

    var apiConfig = config.api || {};
    var host = apiConfig.internalHost || apiConfig.host;  // from web server to api use internalHost name
    var useSSL = apiConfig.serverUseSSL !== undefined ?
        apiConfig.serverUseSSL : config.useSSL;
    baseUrl = (useSSL ? 'https://' : 'http://') + host;

    var port = config.api.port;
    if (port !== 80 && port !== 443) {
        baseUrl += ':' + port;
    }

    baseUrl += '/' + config.api.version;

    return config;
}

// add to the class
_.extend(ApiclientAdapter, {
    init:       init,
    webInit:    init
});

/**
 * Send the request to the restful endpoint
 * @param httpMethod
 * @param path
 * @param req
 */
function send(httpMethod, path, req) {
    req = req || {};
    httpMethod = httpMethod.toUpperCase();

    var deferred = Q.defer();
    var url = baseUrl + path;
    var data = req.data || {};          // separate out data from request
    delete req.data;

    var isAdmin = req.caller && req.caller.role === 'admin';
    delete req.caller;

    var id = req._id || data._id;       // get id from request or data
    if (req._id) { delete req._id; }    // delete id from request so no dupe

    var session = cls.getNamespace('appSession');
    var caller = session && session.active && session.get('caller');
    if (caller && !isAdmin) {
        _.extend(req, {                 // onBehalfOf used by API to know who is the caller
            onBehalfOfType: caller.type,
            onBehalfOfId:   caller._id + '',
            onBehalfOfRole: caller.role,
            onBehalfOfName: caller.name
        });
    }

    _.each(req, function (val, key) {
        if (!_.isString(val)) { req[key] = JSON.stringify(val); }
    });

    // replace the ID portion of the URL
    url = id ?
        url.replace('{_id}', id + '') :
        url.replace('/{_id}', '');

    var reqConfig = {
        headers:    headers,
        url:        url,
        method:     httpMethod,
        qs:         _.isEmpty(req) ? undefined : req,
        json:       _.isEmpty(data) ? true : data
    };

    // if baseUrl not there yet, wait for 100 seconds until it is (i.e. during system startup)
    if (!baseUrl) {
        setTimeout(function () {
            makeRequest(reqConfig, deferred);
        }, 100);
    }
    else {
        makeRequest(reqConfig, deferred);
    }

    return deferred.promise;
}

function makeRequest(reqConfig, deferred) {
    request(reqConfig, function (err, resp, obj) {
        if (err)                            { deferred.reject(err); }
        else if (resp.statusCode !== 200)   { deferred.reject(obj || resp.statusMessage); }
        else                                { deferred.resolve(obj); }
    });
}

// add send to the prototype for an instance of apiclient adapter
_.extend(ApiclientAdapter.prototype, {
    send: send
});

// return the class
module.exports = ApiclientAdapter;
