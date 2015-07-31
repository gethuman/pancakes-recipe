/**
 * Copyright 2013 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 8/18/13
 *
 * Used for various operations on objects that goes beyond underscore/lodash (i.e. filter, map, etc.)
 */
module.exports = function (_) {
    // @module({ "client": true })

    /**
     * Recursively go into an object and make sure no fields matching remove list
     * exist
     * @param data Data to be changed
     * @param fieldsToRemove An array of field names
     */
    function removeAllFieldsFromObj(data, fieldsToRemove) {

        // if data is an array, loop through it and call this function recursively
        if (_.isArray(data)) {
            _.each(data, function (item) {
                removeAllFieldsFromObj(item, fieldsToRemove);
            });
        }
        else if (!_.isFunction(data) && _.isObject(data)) {
            _.each(data, function (item, key) {
                if (fieldsToRemove.indexOf(key) >= 0) {
                    delete data[key];
                }
                else {
                    removeAllFieldsFromObj(item, fieldsToRemove);
                }
            });
        }
    }

    /**
     * Translate data from one format to another. The map contains keys
     * with the values from the data and then the values of the map correspond to the
     * desired output. For example: "col1": "some.thing.blah" would move the value
     * for 'col1' into a value 'blah' that is within an object 'thing' within another
     * object 'some'
     *
     * @param map An object with the mapping
     * @param data The data to be changed
     */
    function mapData(map, data) {
        if (!map || !_.isObject(map) || !data || !_.isObject(data)) {
            return data;
        }

        var obj = {};
        _.each(map, function (targets, sourceName) {

            // if not an array, turn it into one for the sake of our logic
            if (!_.isArray(targets)) {
                targets = [targets];
            }

            // loop through targets
            _.each(targets, function (target) {
                var pathParts = target.split('.');
                var lastItemIndex = pathParts.length - 1;
                var pointer = obj;
                var sourceValue = data[sourceName];

                // if the source value actual exists, attempt to map it to the target data
                if (sourceValue) {
                    _.each(pathParts, function (part, index) {
                        if (index < lastItemIndex) {
                            if (!pointer.hasOwnProperty(part)) {
                                pointer[part] = {};
                            }
                            pointer = pointer[part];
                        }
                        else {
                            pointer[part] = sourceValue;
                        }
                    });
                }
            });
        });

        return obj;
    }

    /**
     * Get a value within given data by traversing the data according to a
     * dot deliminated field. For example, if the data is { foo: { choo: 'some' } }
     * and then the field is foo.choo, the return value would be 'some'.
     *
     * @param data
     * @param field
     * @param defaultValue
     */
    function getNestedValue(data, field, defaultValue) {
        if (!data || !field) { return defaultValue; }

        var pntr = data;
        var fieldParts = field.split('.');

        var i, fieldPart;
        for (i = 0; i < fieldParts.length; i++) {
            fieldPart = fieldParts[i];
            pntr = pntr[fieldPart];
            //if (!pntr) { return pntr; }
            if (!pntr) { return defaultValue; }
        }

        return pntr || defaultValue;
    }

    /**
     * Set a nested value based on a field param which can have a nested field
     * separated by dots (ex: blah.foo.me)
     * @param data
     * @param field
     * @param value
     */
    function setNestedValue(data, field, value) {
        var fieldParts = _.isArray(field) ? field : field.split('.');

        // if no nesting, just set the value
        if (fieldParts.length === 1) {
            data[field] = _.isString(value) ? value.trim() : value;
            return;
        }

        // make sure the parent value exists
        data[fieldParts[0]] = data[fieldParts[0]] || {};

        // recursively call to go down a level
        setNestedValue(data[fieldParts[0]], fieldParts.slice(1, fieldParts.length), value);
    }

    /**
     * True if the given data matches the criteria. If criteria empty,
     * then always true
     *
     * Examples
     *
     * Obj: { a: 'monday', b: 'tuesday' }  Criteria: { a: 'monday' } // true
     * Obj: { a: 'monday', b: 'tuesday' }  Criteria: { a: 'tuesday' } // false
     * Obj: { a: 'monday', b: 'tuesday' }  Criteria: { c: 'monday' } // false
     * Obj: { a: 'monday', b: 'tuesday' }  Criteria: { a: '!tuesday' } // true
     *
     * @param data
     * @param criteria
     * @returns {Boolean}
     */
    function matchesCriteria(data, criteria) {
        data = data || {};
        criteria = criteria || {};

        var match = true;
        _.each(criteria, function (val, key) {
            var hasNotOperand = false;
            if (_.isString(val) && val.length > 1) {
                if ( val.charAt(0) === '!' ) {
                    hasNotOperand = true;
                }
            }
            var dataValue = getNestedValue(data, key);
            var vals = _.isArray(val) ? val : [val];
            if (vals.indexOf(dataValue) < 0) {
                match = false;
            }
            if ( hasNotOperand ) {
                match = !match;
            }
        });

        return match;
    }

    // expose functions
    return {
        removeAllFieldsFromObj: removeAllFieldsFromObj,
        mapData: mapData,
        getNestedValue: getNestedValue,
        setNestedValue: setNestedValue,
        matchesCriteria: matchesCriteria
    };
};