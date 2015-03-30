import url from 'url';
import request from 'request';
import extend from 'extend';
import runkeeper from './runkeeper';

const AUTHORIZATION_URL = 'https://runkeeper.com/apps/authorize';
const ACCESS_TOKEN_URL = 'https://runkeeper.com/apps/token';
const API_HOST = 'api.runkeeper.com';
const USER_URL = 'http://api.runkeeper.com/user';
const USER_PATH = '/user';

class RunkeeperApi {
    constructor(options) {
        this._bearerToken = options.token;
        this._userPromise = null;
    }

    _getResourse(options) {
        var resourseUrl = url.format(extend(options, {
            protocol: 'http',
            host: API_HOST
        }));

        return new Promise((resolve, reject) => {
            request.get(
                resourseUrl,
                {
                    auth: {bearer: this._bearerToken},
                    qs: options.qs
                },
                (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(body);
                    }
                }
            )
        });
    }

    getUser() {
        if (!this._userPromise) {
            this._userPromise = new Promise((resolve, reject) => {
                request.get(
                    USER_URL,
                    {auth: {bearer: this._bearerToken}},
                    function (error, response, body) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(runkeeper.parseUser(body));
                        }
                    }
                );
            });
        }
        return this._userPromise;
    }

    getProfile() {
        return Promise.resolve(this.getUser()).then((user) => {
            return new Promise((resolve, reject) => {
                request.get(
                    url.format({
                        protocol: 'http',
                        host: API_HOST,
                        pathname: user.profile
                    }),
                    {auth: {bearer: this._bearerToken}},
                    (error, response, body) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(runkeeper.parseProfile(body));
                        }
                    }
                );
            });
        });
    }

    getFitnessActivity() {
        return Promise.resolve(this.getUser()).then((user) => {
            return new Promise((resolve, reject) => {
                request.get(
                    url.format({
                        protocol: 'http',
                        host: API_HOST,
                        pathname: user.fitness_activities
                    }),
                    {auth: {bearer: this._bearerToken}},
                    (error, response, body) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(runkeeper.parseFitnessActivity(body));
                        }
                    }
                );
            });
        })
    }

    getFitnessActivityIterator(options) {
        var resourseUrlOptions;
        var done = false;
        var next = function next() {
            if (done) {
                return Promise.resolve(null);
            }

            return Promise.resolve(this.getUser()).then((user) => {
                resourseUrlOptions = resourseUrlOptions || {
                    pathname: user.fitness_activities,
                    qs: options
                };
                return new Promise((resolve, reject) => {
                    this._getResourse(resourseUrlOptions).then((body) => {
                        var data = JSON.parse(body);
                        var nextUrl = data.next;
                        //console.log(data);
                        if (nextUrl) {
                            resourseUrlOptions = url.parse(nextUrl);
                        } else {
                            done = true;
                        }
                        resolve(data);
                    }).catch(reject);
                });
            }).catch(console.log);
        };
        return {
            next: next.bind(this)
        }
    }

    getAllFitnessActivity(options) {
        var noEarlierThan = options.noEarlierThan;
        console.log('==== getting', noEarlierThan);
        return Promise.resolve(this.getUser()).then((user) => {
            this._getResourse({
                pathname: user.fitness_activities,
                qs: {
                    //noEarlierThan: noEarlierThan
                }
            }).then((body) => {
                var fitnessActivity = runkeeper.parseFitnessActivity(body);
                var nextResource = fitnessActivity.next;
                console.log(fitnessActivity.next);
                if (nextResource) {

                }

                function getNextFitnessActivity(path) {

                }
            });
        });
    }
}

export default RunkeeperApi;
