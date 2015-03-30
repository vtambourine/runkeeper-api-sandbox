import nock from 'nock';
import request from 'request';
import RunkeeperApi from '../server/lib/runkeeper-api.js';

describe('Runkeeper API', () => {
    var runkeeperApi;

    beforeEach(() => {
        runkeeperApi = new RunkeeperApi({token: 'a1b2c3'});
        spyOn(request, 'get').and.callThrough();
    });

    describe('getUser()', () => {
        it('should fulfill with user info.', (done) => {
            runkeeperApi.getUser().then((data) => {
                expect(data).not.toBeNull();
                expect(data.userID).toEqual(9310737);
                done();
            }).catch((error) => {
                console.log('error')
            });
        });

        fit('should make request only once', (done) => {
            nock('http://api.runkeeper.com')
                .get('/user')
                .once()
                .replyWithFile(200, __dirname + '/helpers/fixtures/user.json');

            Promise.all([
                runkeeperApi.getUser(),
                runkeeperApi.getUser(),
                runkeeperApi.getUser()
            ]).then((results) => {
                //console.log(results)
                console.log('done here', request.get.calls.count());
                throw('error')
                done();
            });
        });
    })
});
