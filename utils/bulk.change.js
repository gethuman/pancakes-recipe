/**
 * Author: Jeff Whelpley
 * Date: 9/30/14
 *
 * Facilitate bulk mongo changes
 */
module.exports = function (Q) {

    /**
     * Constructor used to start the undordered bulk operation
     * @param model
     * @constructor
     */
    function BulkChange(model) {
        this.model = model;
        this.bulk = model.collection.initializeUnorderedBulkOp();
        this.isChange = false;
    }

    /**
     * Add an upsert statement to the bulk operations
     * @param criteria
     * @param doc
     */
    BulkChange.prototype.upsert = function upsert(criteria, doc) {
        this.isChange = true;
        this.bulk.find(criteria).upsert().updateOne({ $set: doc });
        this.bulk.insert(doc);
    };

    /**
     * Do update
     * @param criteria
     * @param doc
     */
    BulkChange.prototype.update = function update(criteria, doc) {
        this.isChange = true;
        this.bulk.find(criteria).update({ $set: doc });
    };

    /**
     * Execute the bulk updates
     * @returns {*}
     */
    BulkChange.prototype.exec = function exec() {
        var deferred = Q.defer();

        // if no upserts, just return a resolved promise
        if (!this.isChange) { return new Q(); }

        // else execute the upserts
        this.bulk.execute(function (err, results) {
            err ? deferred.reject(err) : deferred.resolve(results);
        });

        return deferred.promise;
    };

    // expose the bulk upsert class
    return BulkChange;
};