import {expect} from 'chai';
import sinon from 'sinon';
import request from 'request';
import RunkeeperApi from '../server/lib/runkeeper-api.js';
import mockServer from './helpers/mock-server.js';

describe('Runkeeper API', () => {
    var runkeeperApi;

    beforeEach(() => {
        runkeeperApi = new RunkeeperApi({token: 'a1b2c3'});
        mockServer();
        sinon.spy(request, 'get');
    });

    afterEach(() => {
        request.get.restore();
    });

    describe('getUser()', () => {
        it('should fulfill with user info.', (done) => {
            runkeeperApi.getUser().then((data) => {
                expect(data).not.to.be.null;
                expect(data.userID).to.equal(9310737);
                done();
            }).catch(done);
        });

        it('should make request only once', (done) => {
            Promise.all([
                runkeeperApi.getUser(),
                runkeeperApi.getUser(),
                runkeeperApi.getUser()
            ]).then(() => {
                expect(request.get.callCount).to.be.equal(1);
                done();
            }).catch(done);
        });
    })
});
