/**
 * Author: Jeff Whelpley
 * Date: 3/31/14
 *
 * This is the custom error that should be used whenever there is
 * a rejection within the app
 */
module.exports = function (_, errorDecoder, casing) {

    /**
     * Constructor recieves a object with options that are used
     * to define values on the error. These values are used at the
     * middleware layer to translate into friendly messages
     *
     * @param opts
     * @constructor
     */
    var AppError = function (opts) {
        this.code = opts.code;
        this.message = this.msg = opts.msg;
        this.type = opts.type;
        this.err = opts.err;
        this.stack = (new Error(opts.msg)).stack;
    };

    // AppError inherits from Error
    AppError.prototype = new Error();

    // loop through errors and add functions
    _.each(errorDecoder, function (details, code) {
        AppError[casing.camelCase(code, '_')] = function (msg) {
            return new AppError({ code: code, msg: msg });
        };
    });

    // return the AppError class
    return AppError;
};