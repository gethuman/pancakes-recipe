/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 7/17/14
 *
 * This file contains all common validations based off keys that
 * are typically in the resource file for a given resource.
 */
module.exports = function (_, schemaDefinitions, log) {
    // @module({ "client": true })

    // these are the common validations that can be used for a form element
    var check = {
        type: function (schema, userInput) {
            switch (schema.type) {
                case 'Number': return !isNaN(userInput);
                case 'Boolean':
                    return _.isBoolean(userInput) ||
                        ['true', 'false'].indexOf(userInput) >= 0;
                default: return true;
            }
        },
        required: function (schema, userInput) {
            return !!userInput;
        },
        match: function (schema, userInput) {
            var exp = schema['ui-match'] || schema.match;

            if (_.isString(exp)) {
                var lastSlash = exp.lastIndexOf('/');
                var modifiers = exp.substring(lastSlash + 1);
                exp = exp.substring(1, lastSlash);
                exp = new RegExp(exp, modifiers);
            }

            return exp.test(userInput);
        },
        minSize: function (schema, userInput) {
            var msize = schema['ui-minSize'] || schema.minSize;
            return userInput && userInput.trim().length >= msize;
        },
        maxSize: function (schema, userInput) {
            var msize = schema['ui-maxSize'] || schema.maxSize;
            return userInput && userInput.trim().length <= msize;
        }
    };

    // each validation has an error message associated with it
    var errorMessage = {
        type:       'Must be {type}',
        required:   'Required field',
        minSize:    'Too short (current: {length}, minimum: {minSize})',
        maxSize:    'Too long (current: {length}, maximum: {maxSize})'
    };

    /**
     * Take a string like user.password and get the schemaDefinitions for it
     * @param path
     * @returns {*}
     */
    function getSchema(path) {
        var parts = path.split('.');
        var collectionName = parts[0];
        var fieldName = parts[1];

        // if format not user.field or field not in the schemaDefinitions object, then log error without breaking
        if (parts.length !== 2 || !schemaDefinitions[collectionName] || !schemaDefinitions[collectionName][fieldName]) {
            log.error('No schemaDefinitions for : ' + path, null);
            return {};
        }

        return schemaDefinitions[collectionName][fieldName];
    }

    /**
     * If already an error, need to return right away
     * @param fn
     * @returns {Function}
     */
    function wrapFn(fn) {
        return function (req) {
            return req.error ? req : fn(req);
        };
    }

    /**
     * Take thing originally from the gh-validate attribute and turn it into an obj and fns array
     * @param validateAttr
     * @param schema
     * @param validateFns
     */
    function parseValidateAttr(validateAttr, schema, validateFns) {

        // if an array, loop through and recurse
        if (_.isArray(validateAttr)) {
            _.each(validateAttr, function (validator) {
                parseValidateAttr(validator, schema, validateFns);
            });

            return;
        }

        // if validateAttr is a string, then assume it is field reference
        if (_.isString(validateAttr)) {
            _.extend(schema, getSchema(validateAttr));
        }
        else if (_.isFunction(validateAttr)) {
            validateFns.push(wrapFn(validateAttr));
        }
        else if (_.isObject(validateAttr)) {
            _.extend(schema,  validateAttr);
        }
    }

    /**
     * Generate validator function off of the given schema object
     * @param schema
     * @returns {Function}
     */
    function generateValidationFn(schema) {
        return function (req) {

            // if already an error, return without doing any additional validation
            if (req.error) { return req; }

            var keys = Object.keys(schema);
            var len = (req.value && req.value.trim().length) || 0;
            var i, key, originalKey;

            for (i = 0; i < keys.length; i++) {
                key = originalKey = keys[i];
                if (key.indexOf('ui-') === 0) {
                    key = key.substring(3);
                }

                // if validation function exists but it returns false then we have error
                if (check[key] && !check[key](schema, req.value)) {
                    var errMsg = schema[key + 'Desc'] || errorMessage[key] || 'Invalid input';
                    req.error = errMsg
                        .replace('{' + key + '}', schema[originalKey])
                        .replace('{value}', req.value)
                        .replace('{length}', len);
                    break;
                }
            }

            return req;
        };
    }

    // expose functions
    return {
        check: check,
        errorMessage: errorMessage,
        getSchema: getSchema,
        wrapFn: wrapFn,
        parseValidateAttr: parseValidateAttr,
        generateValidationFn: generateValidationFn
    };
};
