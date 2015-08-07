/**
 * Copyright 2013 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 8/18/13
 *
 * Mapping of potential API errors to friendly messages
 */
module.exports = function () {
    return {
        'invalid_request_error': {
            httpErrorCode: 400,
            friendlyMessage: 'Your request was invalid. This may be do to ' +
                'missing or incorrect input parameters.'
        },
        'invalid_credentials' : {
            httpErrorCode: 401,
            friendlyMessage: 'Missing or invalid authorization credentials.'
        },
        'fakeblock_error': {
            httpErrorCode: 403,
            friendlyMessage: 'Access denied. One or more input parameter invalid for ' +
                'this request for the current user.'
        },
        'no_access': {
            httpErrorCode: 403,
            friendlyMessage: 'Access denied. Please contact us ' +
                'about adding this service to your contract.'
        },
        'no_user': {
            httpErrorCode: 403,
            friendlyMessage: 'No user found for given credentials.'
        },
        'auth_failed' : {
            httpErrorCode: 403,
            friendlyMessage: 'Could not login with that username and password.'
        },
        'password_reset_invalid' : {
            httpErrorCode: 403,
            friendlyMessage: 'Password reset request is invalid.'
        },
        'no_access_user' : {
            httpErrorCode: 403,
            friendlyMessage: 'Access denied.'
        },
        'invalid_password' : {
            httpErrorCode: 403,
            friendlyMessage: 'The existing password you entered is not correct.'
        },
        'user_already_exists' : {
            httpErrorCode: 403,
            friendlyMessage: 'The email you entered is already registered.'
        },
        'not_found': {
            httpErrorCode: 404,
            friendlyMessage: 'The requested resource was not found.'
        },
        'account_locked': {
            httpErrorCode: 423,
            friendlyMessage: 'Account locked. Please contact us.'
        },
        'license_limit': {
            httpErrorCode: 429,
            friendlyMessage: 'API limit reached. Please contact us ' +
                'about increasing your limit.'
        },
        'api_threshold': {
            httpErrorCode: 429,
            friendlyMessage: 'API usage limits violated. Please contact us.'
        },
        'api_error': {
            httpErrorCode: 499,
            friendlyMessage: 'Sorry, something went wrong. If this error ' +
                'continues to occur, please contact customer care at us.'
        },
        'external_error': {
            httpErrorCode: 499,
            friendlyMessage: 'An error occurred while calling out to an external ' +
                'service or resource. Try to resubmit your request and contact ' +
                'us if you continue to experience issues.'
        },
        'unknown_error': {
            httpErrorCode: 500,
            friendlyMessage: 'Unknown error occurred'
        }
    };
};

