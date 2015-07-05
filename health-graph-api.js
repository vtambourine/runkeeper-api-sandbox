import url from 'url';
import request from 'co-request';

const API_HOST = 'http://api.runkeeper.com';
const USER_URL = 'http://api.runkeeper.com/user';

class HealthGraphAPI {
    constructor(options) {
        this._bearerToken = options.token;
        this._request = request.defaults({
            auth: {bearer: this._bearerToken}
        });
        this._user = null;
    }

    *user() {
        if (!this._user) {
            var response = yield this._request.get(USER_URL);
            if (response.statusCode === 200) {
                this._user = JSON.parse(response.body);
            } else {
                throw new Error('Error in getting user by ' + this._bearerToken);
            }
        }
        return this._user;
    }

    *records() {
        var user = yield this.user();
        var response = yield this._request.get(url.resolve(API_HOST, user.records));
        if (response.statusCode === 200) {
            return JSON.parse(response.body);
        }
    }
}

export default HealthGraphAPI;
