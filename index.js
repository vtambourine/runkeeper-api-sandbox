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
var ACCESS_TOKEN = process.env.ACCESS_TOKEN || '44a4df799f5a4bc4ad3f20696172415b';

var app = koa();

app.use(views('views', {
    map: {html: 'handlebars'}
}))

// TODO: Move to separate files
var router = Router()
    .get('/', function *(next) {
        var healthGraph = new HealthGraphAPI({token: ACCESS_TOKEN});
        var user = yield healthGraph.user();
        var records = yield healthGraph.records();
        // return this.body = records;
        var totalDistance = records.reduce((result, record) => {
            if (record.activity_type === 'Running') {
                result = record.stats.reduce((result, stat) => {
                    if (stat.stat_type === 'OVERALL') {
                        result = stat.value;
                    }
                    return result;
                }, 0)
            }
            console.log(record);
            return result;
        }, 0);
        yield this.render('index', {distance: totalDistance / 1000});
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
        this.body = authorizationUrl;
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
            this.body = result.body;
        } else {
            this.body = 'Error'
        }
    });

app.use(router.routes());

app.listen(3000);

console.log('Hello, World!');
