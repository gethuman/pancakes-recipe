/**
 * Author: Jeff Whelpley
 * Date: 6/16/15
 *
 * Testing jwt
 */
var name    = 'utils/jwt';
var taste   = require('../../pancakes.taste.js')();
var jwt     = taste.flapjack(name);

describe('UNIT ' + name, function () {
    //it('should decode my thing', function () {
    //    var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NTZlZmU2OGQ2MzRiMmZmMTA1YTBmMmEiLCJpYXQiOjE0MzQ0NjcwODh9.5fTaOq_UpfvzgLs10ihmGgGAVThFeFkz727Jm_Lhc6o';
    //    var privateKey = 'BbZJjyoXAdr8BUZuiKKA22imKfrSmQ6fv8kZ7OFfc';
    //
    //    return jwt.verify(token, privateKey)
    //        .then(function (decoded) {
    //            console.log('decoded is ' + JSON.stringify(decoded));
    //            return {};
    //        });
    //});
});
