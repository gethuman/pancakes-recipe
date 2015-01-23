/**
 * Copyright 2013 GetHuman LLC
 * Author: jeffwhelpley
 * Date: 11/12/13
 *
 * This object is used to help serialize and deserialize dates for JSON transfer
 */
module.exports = function (_) {

    /**
     * Get a date in the future based off the frequency
     * @param date The starting date
     * @param frequency [none, instant, hourly, daily, weekly]
     */
    function datePlusFrequency(date, frequency) {
        var minutes;

        date = date || new Date();  // default is today
        frequency = frequency || 'hourly';  // default is hourly

        switch (frequency) {
            case 'none':
                minutes = 525949;  // set far in future
                break;
            case 'instant':
                minutes = 1;
                break;
            case 'hourly':
                minutes = 60;
                break;
            case 'daily':
                minutes = 1440;
                break;
            case 'weekly':
                minutes = 10080;
                break;
            default:
                minutes = 0;
        }

        return new Date(date.getTime() + (minutes * 60000));
    }

    /**
     * Serialize a date
     * @param date
     * @returns {number|*}
     */
    function serializeDate(date) {
        if (_.isDate(date)) {
            return date.toString();
        }
        else {
            return date;
        }
    }

    /**
     * Recursively go through object and convert dates
     * @param obj
     */
    function serializeAllDates(obj) {

        // if it is a date, then return serialized version
        if (_.isDate(obj)) {
            return serializeDate(obj);
        }

        // if array or object, loop over it
        if (_.isArray(obj) || _.isObject(obj)) {
            _.forEach(obj, function (item, key) {
                obj[key] = serializeAllDates(item);
            });
        }

        return obj;
    }

    // expose functions
    return {
        datePlusFrequency: datePlusFrequency,
        serializeDate: serializeDate,
        serializeAllDates: serializeAllDates
    };
};

