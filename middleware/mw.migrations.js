/**
 * Copyright 2015 GetHuman LLC
 * Author: christian
 * Date: 11/23/15
 *
 * I forgot to write about what this component does
 */
module.exports = function (Q, fs, casing, pancakes, log, config) {

    var migrationService = null;

    function addMigration(dir) {
        var migrationName = null;
        var migration  = null;
        return Q.fcall(function () {
            migrationName = casing.camelCase(dir) + 'Migration';
            migration = pancakes.cook(migrationName);

            if (migration.dependsOn) { // for now, handle only the array
                var ops = [];
                migration.dependsOn.forEach(function (depMigration) {
                    log.info('Migration ' + dir + ' depends on ' + depMigration + ', so adding that first...');
                    ops.push(addMigration(depMigration));
                });
                return Q.all(ops); // run all dependencies first
            }
            else {
                return true;
            }
        })
            .then(function () {
                if ( migration && migration.run ) {
                    migrationService = migrationService || pancakes.getService('migration');
                    if (!migrationService) {
                        throw new Error('MigrationService does not exist- be sure that migration/migration.resource is in your project');
                    }
                    return migrationService.create({caller: migrationService.admin, data: {
                        slug: migrationName
                    }})
                        .then(function (newMigration) {
                            log.info('Added ' + migrationName);
                            return newMigration;
                        })
                        .catch(function () {
                            log.error(migrationName + ' had already been added');
                        });
                }
                else {
                    return true;
                }
            })
            .catch(function (err) {
                log.info('Error while running ' + migrationName + ': ' + err);
            });
    }

    return {
        init: function init(ctx) {
            var dirs = [];
            try {
                dirs = [].concat(fs.readdirSync(process.cwd() + '/migrations'));
            }
            catch (e) {
                log.info('Found no /migrations directory from which to run migrations');
            }

            log.info(dirs.length + ' migration(s) found: ' + dirs);

            var ops = [];
            dirs.forEach(function (dir) {
                ops.push(addMigration(dir));
            });

            return Q.all(ops)
                .then(function () {
                    migrationService = migrationService || pancakes.getService('migration');
                    if (config.env === 'production' || config.env === 'staging') {
                        return true;
                    }
                    else if ( migrationService && migrationService.flush ) {
                        return migrationService.flush({caller: migrationService.admin})   // if on development, just go
                            .catch(function (err) {
                                log.error(err);
                            });
                    }
                    else {
                        throw new Error('Be sure that migrationService is added to your project (and that it has a flush method)');
                    }
                })
                .then(function () {
                    return ctx; // return this no matter what so that the show goes on- migrations or no migrations
                });
        }
    };
};

