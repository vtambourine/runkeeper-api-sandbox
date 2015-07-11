import url from 'url';
import querystring from 'querystring';
import koa from 'koa';
import serve from 'koa-static';
import Router from 'koa-router';
import views from 'koa-views';
import HealthGraphAPI from './health-graph-api';
import request from 'co-request';
import config from './config.keys';

var CLIENT_ID = process.env.CLIENT_ID || config.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET || config.CLIENT_SECRET;
// var ACCESS_TOKEN = process.env.ACCESS_TOKEN || '44a4df799f5a4bc4ad3f20696172415b';

var app = koa();

app.use(views('views', {
    map: {html: 'swig'}
}))

// TODO: Move to separate files
var router = Router()
    .get('/', function *(next) {
        var token = this.cookies.get('bearer');
        if (token) {
            var healthGraph = new HealthGraphAPI({token});
            var records = yield healthGraph.records();
            var totalDistance = records.reduce((result, record) => {
                if (record.activity_type === 'Running') {
                    result = record.stats.reduce((result, stat) => {
                        if (stat.stat_type === 'OVERALL') {
                            result = stat.value;
                        }
                        return result;
                    }, 0)
                }
                return result;
            }, 0);
            yield this.render('result', {distance: totalDistance });
        } else {
            yield this.render('hello');
            // this.redirect('/register/auth')
        }
    })
    .get('/register/auth', function *(next) {
        var authorizationUrl = url.format(
            Object.assign(url.parse(config.AUTHORIZATION_URL), {
                query: {
                    client_id: CLIENT_ID,
                    response_type: 'code',
                    redirect_uri: 'http://localhost:3000/register'
                }
            }
        ));
        this.redirect(authorizationUrl);
        this.status = 301;
    })
    .get('/register', function *(next) {
        var code = this.request.query.code;
        var result = yield request.post({
            url: config.ACCESS_TOKEN_URL,
            form: {
                grant_type: 'authorization_code',
                code: code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: 'http://localhost:3000/register'
                // redirect_uri: 'http://3c5c79b3.ngrok.com/register'
            }
        });
        if (result.statusCode === 200) {
            var result = JSON.parse(result.body);
            console.log(result);
            if (result.error) yield this.render('error', {error: 'Error'});
            return;
            console.log(result, typeof result);
            var token = result.access_token;
            this.cookies.set('bearer', token, {expires: new Date(Date.now() + 60 * 60 * 24 * 365 * 1000)})
            this.redirect('/');
        } else {
            this.body = 'Error'
        }
    })
    .get('/deauth', function *(next) {
        var token = this.cookies.get('bearer');
        var result = yield request.post({
            url: 'https://runkeeper.com/apps/de-authorize',
            form: {
                'access_token': token
            }
        });
        if (result.statusCode === 204) {
            this.cookies.set('bearer');
            this.redirect('/');
        } else {
            console.log('WAT');
        }
    });

app.use(router.routes());

app.use(function *(next) {
    if (this.status === 404) {
        this.status = 404;
        this.body = 'Page not found';
    }
});

app.listen(3000);

console.log('Hello, World!');
