/**
 * Author: Jeff Whelpley
 * Date: 2/9/14
 *
 * Functions for dealing with base64 encoding. Only used on server for now.
 */
module.exports = function (AppError) {

    /**
     * Take a number and translate it into our custom base64 encoded
     * string
     *
     * @param number
     * @returns {string}
     */
    function encode(number) {
        if (number === 0) {
            return '';
        }

        var quotient = Math.floor(number / 64);
        var remainder = number % 64;

        var digit;
        if (remainder < 10) {
            digit = '' + remainder;
        }
        else if (remainder < 36) {
            digit = String.fromCharCode(remainder + 55);
        }
        else if (remainder < 62) {
            digit = String.fromCharCode(remainder + 61);
        }
        else if (remainder === 62) {
            digit = '-';
        }
        else if (remainder === 63) {
            digit = '_';
        }

        return encode(quotient) + '' + digit;
    }

    /**
     * For a given string that has been encoded already with our custom base64
     * encoding scheme, translate it into a number
     *
     * @param base64string
     * @returns {number}
     */
    function decode(base64string) {
        var number = 0;
        var chars = base64string.split('');
        var len = chars.length;
        var val10;
        var val64;
        var asciiVal;

        for (var i = 0; i < len; i++) {

            val64 = chars[len - 1 - i];
            asciiVal = val64.charCodeAt(0);
            val10 = 0;
            if (val64 === '_') {
                val10 = 63;
            }
            else if (val64 === '-') {
                val10 = 62;
            }
            else if (asciiVal > 96 && asciiVal < 123) {
                val10 = asciiVal - 61;
            }
            else if (asciiVal > 64 && asciiVal < 91) {
                val10 = asciiVal - 55;
            }
            else if (asciiVal > 47 && asciiVal < 58) {
                val10 = asciiVal - 48;
            }
            else {
                throw new AppError({ msg: 'Non-base64value in encoded string' });
            }

            number += (Math.pow(64, i) * val10);
        }

        return number;
    }

    // expost the encode and decode values
    return {
        encode: encode,
        decode: decode
    };
};