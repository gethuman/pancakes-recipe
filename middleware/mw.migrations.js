/**
 * Copyright 2015 GetHuman LLC
 * Author: christian
 * Date: 11/23/15
 *
 * I forgot to write about what this component does
 */
module.exports = function (Q, fs, casing, pancakes, migrationService, log) {

    function runMigration(dir) {
        var migrationName = casing.camelCase(dir) + 'Migration';
        var migration = pancakes.cook(migrationName);
        if ( migration && migration.run ) {
            return migrationService.find({caller: migrationService.admin, where: {slug: migrationName}, findOne:true})
                .then(function (existingMigration) {
                    return existingMigration ? existingMigration : migrationService.create({
                        caller: migrationService.admin,
                        data: {
                            slug: migrationName
                        }
                    });
                })
                .then(function (existingMigration) {
                    if ((migration.frequency && migration.frequency === 'each')
                        || existingMigration.totalRuns < 1) {
                        var startTime = (new Date()).getTime();
                        log.info('Running ' + migrationName + '...');
                        return migration.run()
                            .then(function () {
                                var endTime = (new Date()).getTime();
                                var diffTime = (endTime - startTime) / 1000;
                                log.info('Ran ' + migrationName + ' in ' + diffTime + 's, total runs: ' + (existingMigration.totalRuns + 1));
                                return migrationService.update({
                                    caller: migrationService.admin,
                                    _id: existingMigration._id,
                                    data: {
                                        totalRuns: existingMigration.totalRuns + 1
                                    }
                                });
                            });
                    }
                    else {
                        log.info('Skipping ' + migrationName + ', already ran ' + existingMigration.totalRuns + ' time(s)');
                    }
                });
        }
        else {
            log.info('No migration info supplied for ' + migrationName);
            return true;
        }
    }

    return {
        init: function init(ctx) {
            var dirs = [].concat(fs.readdirSync(process.cwd() + '/migrations'));

            log.info(dirs.length + ' migration(s) found: ' + dirs);

            var ops = [];
            dirs.forEach(function (dir) {
                ops.push(runMigration(dir));
            });

            return Q.all(ops)
                .then(function () {
                    return ctx;
                })
                .catch(log.error);
        }
    };
};

