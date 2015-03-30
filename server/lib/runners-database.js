import redis from 'redis';

class RunnersDatabase {
    constructor() {
        this._redisClient = redis.createClient();
        this._redisClient.on('error', (error) => {
            console.log('Redis error', error);
        });
    }

    getRunners() {
        return new Promise((resolve, reject) => {
            this._redisClient.keys('*', (error, userIDs) => {
                if (error) {
                    throw error;
                }

                var tokensPromises = userIDs.map((userID) => {
                    return new Promise((resolve, reject) => {
                        this._redisClient.get(userID, (error, response) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(response);
                            }
                        });
                    });
                });

                Promise.all(tokensPromises).then((tokens) => {
                    var runners = userIDs.reduce((result, userID, index) => {
                        result[userID] = tokens[index];
                        return result;
                    }, {});
                    resolve(runners);
                }, reject);
            });
        });
    }

    getRunnerToken(id) {
        return new Promise((resolve, reject) => {
            this._redisClient.get(id, (error, response) => {
                if (error) {
                    throw error;
                }
                resolve(response);
            });
        });
    }

    saveRunnerToken(id, token) {
        this._redisClient.set(id, token, () => {
            this._redisClient.bgsave();
        });
    }
}

export default new RunnersDatabase();
