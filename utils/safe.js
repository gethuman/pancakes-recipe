/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 8/14/14
 *
 * Helper for security access functions
 */
module.exports = function () {
    // @module({ "client": true })

    /**
     * Determine if for a given item (document from the database), a user
     * can edit it. This is true if the user is an admin or if they are the
     * ones who created it.
     *
     * @param item
     * @param user
     * @returns {*|boolean}
     */
    function canEdit(item, user) {
        user = user || {};

        if (user.role === 'admin') { return true; }

        var username = user.username || user.name;
        return item && user && (!item.createUsername || item.createUsername === username);
    }

    // expose functions
    return {
        canEdit: canEdit
    };
};
