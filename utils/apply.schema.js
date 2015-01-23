/**
 * Author: Jeff Whelpley
 * Date: 2/9/14
 */
module.exports = function (_) {

    /**
     * This function will take a piece of data and then filter out all fields that
     * are not defined in a given schema.
     *
     * For example:
     *
     *      var newData = applySchema({ foo: 1, choo: 2 }, { foo: true })
     *
     * in this case, newData will equal { foo: 1 } because the second parameter
     * does not contain a choo
     *
     * @param inputData
     * @param schema
     * @param opts
     * @returns {{}}
     */
    return function applySchema(inputData, schema, opts) {
        var schemaValue, i;
        var data = opts && opts.createDupe ? JSON.parse(JSON.stringify(inputData)) : inputData;

        // if schema is array, it just means we need to drill into first element (see post.comments)
        if (_.isArray(schema)) { schema = schema[0]; }

        // loop through keys in the data
        _.each(data, function (dataValue, key) {

            // if the key is the id, then don't do anything since we are keeping that
            if (key === '_id') {
                return true;
            }

            // if key not _id and schema doesn't have the key, delete it from the data
            if (!schema.hasOwnProperty(key)) {
                delete data[key];
                return true;
            }

            // else we will keep the key and value
            schemaValue = schema[key];

            // if we are dealing with an array we loop through
            if (_.isArray(dataValue) && _.isArray(schemaValue)) {
                for (i = 0; i < dataValue.length; i++) {
                    applySchema(dataValue[i], schemaValue[0], null);
                }
            }
            // if the value is an object go down a level
            else if (!_.isArray(dataValue) && _.isObject(dataValue)) {
                applySchema(dataValue, schemaValue, null);
            }

            return true;
        });

        return data;
    };
};