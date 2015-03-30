import fs from 'fs';
import path from 'path';
import url from 'url';
import querystring from 'querystring';
import request from 'request';
import Hapi from 'hapi';

import RunkeeperApi from './lib/runkeeper-api';
import runnersDatabase from './lib/runners-database.js';

var clientId = '';
var clientSecret = '';
var publicPath = path.join(process.cwd(), 'public');

var server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: publicPath
            }
        }
    }
});

server.connection({
    host: 'localhost',
    port: 3000
});

server.views({
    engines: {
        html: require('handlebars')
    },
    path: path.join(process.cwd(), 'views')
});

server.route({
    method: 'GET',
    path: '/',
    handler(request, reply) {
        console.log(request.app);
        console.log(request.auth);
        console.log(request.domain);
        reply.view('index', {title: 'Run, Rostov, run'});
    }
});

server.route({
    method: 'GET',
    path: '/register',
    handler(req, reply) {
        request.post({
            url: 'https://runkeeper.com/apps/token',
            form: {
                grant_type: 'authorization_code',
                code: req.query.code,
                client_id: clientId,
                client_secret: clientSecret,
                //redirect_uri: 'http://localhost:3000/register'
                redirect_uri: 'http://3c5c79b3.ngrok.com/register'
            }
        }, (error, response, body) => {
            if (!error) {
                var authResponse = JSON.parse(body);
                var tokenType = authResponse.token_type;
                var accessToken = authResponse.access_token;
                if (tokenType === 'Bearer' && accessToken) {
                    var runkeeperApi = new RunkeeperApi({token: accessToken});
                    runkeeperApi.getUser().then((user) => {
                        console.log('here we are');
                        runnersDatabase.saveRunnerToken(user.userID, accessToken);
                    });
                    runkeeperApi.getProfile().then((profile) => {
                        reply.view('register', {
                            code: req.query.code,
                            name: profile.name
                        });
                    }).catch((error) => {
                        console.log(error);
                        reply.view('500').code(500);
                    });
                } else {
                    reply.view('500').code(500);
                }
            } else {
                console.log(error);
                reply.view('500').code(500);
            }
        });
    }
});

server.route({
    method: 'GET',
    path: '/register/auth',
    handler(request, reply) {
        var authorizationUrl = url.format({
            protocol: 'https',
            host: 'runkeeper.com/apps/authorize',
            query: {
                client_id: clientId,
                response_type: 'code',
                //redirect_uri: 'http://localhost:3000/register'
                redirect_uri: 'http://3c5c79b3.ngrok.com/register'
            }
        });
        reply('code').redirect(authorizationUrl);
    }
});

server.route({
    method: '*',
    path: '/{filename*}',
    handler(request, reply) {
        var filename = request.params.filename;
        fs.access(path.join(publicPath, filename), fs.R_OK, (error) => {
            if (error) {
                reply.view('404').code(404);
            } else {
                reply.file(filename);
            }
        });
    }
});

server.start();
console.log('hode');
