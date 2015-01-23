/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 4/28/14
 *
 * Client and server tool for date formatting
 */
module.exports = function (dateMoment) {
    // @module({ "client": true })

    // a little bit of hackery so that we pull moment from the client and server correctly
    var moment = dateMoment;

    // add spanish locale
    moment.locale('es', {
        relativeTime : {
            future : 'en %s',
            past : 'hace %s',
            s : 'unos segundos',
            m : 'un minuto',
            mm : '%d minutos',
            h : 'una hora',
            hh : '%d horas',
            d : 'un día',
            dd : '%d días',
            M : 'un mes',
            MM : '%d meses',
            y : 'un año',
            yy : '%d años'
        }
    });

    // add french locale
    moment.locale('fr', {
        relativeTime : {
            future : 'dans %s',
            past : 'il y a %s',
            s : 'quelques secondes',
            m : 'une minute',
            mm : '%d minutes',
            h : 'une heure',
            hh : '%d heures',
            d : 'un jour',
            dd : '%d jours',
            M : 'un mois',
            MM : '%d mois',
            y : 'un an',
            yy : '%d ans'
        }
    });

    // add en-short locale
    moment.locale('enshort', {
        relativeTime : {
            future: 'in %s',
            past:   '%s ago',
            s:  'secs',
            m:  'a min',
            mm: '%dm',
            h:  'an hr',
            hh: '%dh',
            d:  'a day',
            dd: '%dd',
            M:  'a mon',
            MM: '%d mons',
            y:  'a yr',
            yy: '%dy'
        }
    });

    // add en-medium locale
    moment.locale('enmedium', {
        relativeTime : {
            future: 'in %s',
            past:   '%s ago',
            s:  'secs',
            m:  'a min',
            mm: '%d mins',
            h:  'an hr',
            hh: '%d hrs',
            d:  'a day',
            dd: '%d days',
            M:  'a mon',
            MM: '%d mons',
            y:  'a yr',
            yy: '%d yrs'
        }
    });

    // set locale to en as the default
    moment.locale('en');

    /**
     * Use moment to format the date
     * @param date
     * @param lang
     * @param type
     * @returns {*}
     */
    function getFormattedDate(date, lang, type) {
        date = date || new Date();
        lang = lang || 'en';
        type = type || 'long';

        // set the language for en
        if (lang === 'en' && type === 'short') { lang = 'enshort'; }
        if (lang === 'en' && type === 'medium') { lang = 'enmedium'; }

        // get the date string
        return moment(date).locale(lang).fromNow();
    }

    /**
     * Short format for date
     * @param date
     * @param lang
     * @returns {*}
     */
    function short(date, lang) {
        return getFormattedDate(date, lang, 'short');
    }

    /**
     * Medium format for date
     * @param date
     * @param lang
     * @returns {*}
     */
    function medium(date, lang) {
        return getFormattedDate(date, lang, 'medium');
    }

    /**
     * Long format for date
     * @param date
     * @param lang
     * @returns {*}
     */
    function long(date, lang) {
        return getFormattedDate(date, lang, 'long');
    }

    // exposed functions
    return {
        getFormattedDate: getFormattedDate,
        short: short,
        medium: medium,
        long: long
    };
};