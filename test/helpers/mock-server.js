import request from 'request';
import nock from 'nock';

function mockServer() {
    nock('http://api.runkeeper.com')
        .get('/user')
        .replyWithFile(200, `${__dirname}/fixtures/user.json`);

    nock('http://api.runkeeper.com')
        .get('/profile')
        .replyWithFile(200, `${__dirname}/fixtures/profile.json`);

    nock('http://api.runkeeper.com')
        .get('/fitnessActivities?noEarlierThan=2014-01-01')
        .replyWithFile(200, `${__dirname}/fixtures/fitnessActivities/page0.json`);

    nock('http://api.runkeeper.com')
        .get('/fitnessActivities?page=1&pageSize=25&noEarlierThan=2014-01-01&noLaterThan=2015-03-15&modifiedNoEarlierThan=1970-01-01&modifiedNoLaterThan=2015-03-15')
        .replyWithFile(200, `${__dirname}/fixtures/fitnessActivities/page1.json`);

    nock('http://api.runkeeper.com')
        .get('/fitnessActivities?page=2&pageSize=25&noEarlierThan=2014-01-01&noLaterThan=2015-03-15&modifiedNoEarlierThan=1970-01-01&modifiedNoLaterThan=2015-03-15')
        .replyWithFile(200, `${__dirname}/fixtures/fitnessActivities/page2.json`);

    nock('http://api.runkeeper.com')
        .get('/fitnessActivities?page=3&pageSize=25&noEarlierThan=2014-01-01&noLaterThan=2015-03-15&modifiedNoEarlierThan=1970-01-01&modifiedNoLaterThan=2015-03-15')
        .replyWithFile(200, `${__dirname}/fixtures/fitnessActivities/page3.json`);
}

export default mockServer;
