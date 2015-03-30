var nock = require('nock');
var request = require('request');
//
//nock('http://api.runkeeper.com')
//    .get('/user')
//    .matchHeader('Authorization', function (val) {
//        console.log(val)
//        return val;
//    })
//    .reply(200, 'Hello from Google!');
//    //.replyWithFile(200, __dirname + '/profile-reply.json');
//
//request
//    .get(
//    'http://api.runkeeper.com/user',
//    {
//        auth: {
//            bearer: '44a4df799f5a4bc4ad3f20696172415b'
//        }
//    },
//    (error, res, body) => {
//        console.log('error', error);
//        //console.log('res', res);
//        console.log('body', body)
//    }
//);

var nockBack = require('nock').back;
nockBack.setMode('record');
nockBack.fixtures = __dirname + '/test/fixtures/';


nockBack('aaaa.json', function (nockDone) {
    request
        .get(
        'http://api.runkeeper.com/user',
        {
            auth: {
                bearer: '44a4df799f5a4bc4ad3f20696172415b'
            }
        },
        (error, res, body) => {
            console.log('error', error);
            //console.log('res', res);
            console.log('body', body)
        }
    );
    this.assertScopesFinished(); //throws an exception if all nocks in fixture were not satisfied
    nockDone();
});
