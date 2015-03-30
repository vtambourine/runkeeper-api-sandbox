import RunkeeperApi from './lib/runkeeper-api.js';
import runnersDatabase from './lib/runners-database.js';

runnersDatabase
    .getRunners()
    .then((runners) => {
        console.log('runners', runners);
        var activitiesPromises = Object.keys(runners).map((userID) => {
            var accessToken = runners[userID];
            var runkeeperApi = new RunkeeperApi({token: accessToken});

            var activityIterator = runkeeperApi.getFitnessActivityIterator({
                noEarlierThan: '2015-02-01'
            });

            return new Promise((resolve, reject) => {
                var i = 0;
                (function next() {
                    return activityIterator.next().then((activity) => {
                        if (activity) {
                            i += activity.items.reduce((result, item) => {
                                return result + item.total_distance;
                            }, 0);
                            return next();
                        } else {
                            resolve(i);
                        }
                    }).catch((error) => {
                        console.log(error.stack);
                    });
                })();
            });
        });
        Promise.all(activitiesPromises).then((fitnessActivity) => {
            //console.log('names', runn)
            console.log('activities', fitnessActivity);
            //console.log(JSON.stringify(fitnessActivity, 0, 4));
            //var total = fitnessActivity.reduce((acti))

            console.log('Total distance', fitnessActivity.reduce(function (result, d) {
                    return result + d;
            }, 0));

            throw 'done'
        }, (error) => {
            console.log(error.stack);
        });
    })
    .catch((error) => {
        console.log('last error');
        console.log(error.stack)
    });
