#!/usr/bin/env node

const http = require('http');
const https = require('https');
const Koa = require('koa');
const send = require('koa-send');
const Router = require('koa-router');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = new Koa();
const router = new Router();

require('yargs')
    .command('$0 <file(s)> [options]', 'Serve static file(s) via http or https. (Double dots in file names are invalid)', () => {}, argv => {
        const files = argv._.concat([argv['file(s)']]);
        const protocol = argv.tls ? 'https' : 'http';
        for (const file of files) {
            const sha256 = crypto.createHash('sha256');
            const route = sha256.update(file).digest('hex').substring(0, 8);
            const filename = file.substring(file.lastIndexOf('/') + 1);
            console.log(file, path.resolve(__dirname, file));
            router.get(`/${route}/${filename}`, async ctx => {
                await send(ctx, path.resolve(file), {
                    root: '/', // Serve all files
                    hidden: true
                });
            });
            console.log(`Serving ${file} at:`);
            console.log(`\t${protocol}://${argv.addr}:${argv.port}/${route}/${filename}\n`);
        }
        app.use(router.routes());
        app.use(router.allowedMethods());

        if (!argv.tls) {
            http.createServer(app.callback()).listen(argv.port, argv.addr);
        }
        else {
            https.createServer({
                key: fs.readFileSync(argv.key),
                cert: fs.readFileSync(argv.cert)
            }, app.callback()).listen(argv.port, argv.addr);
        }
    })
    .option('addr', {
        describe: 'Address to bind',
        alias: 'a',
        default: '0.0.0.0'
    })
    .option('port', {
        describe: 'Port to listen to',
        alias: 'p',
        default: '8000'
    })
    .option('tls', {
        describe: 'Enable https',
        type: 'boolean'
    })
    .option('cert', {
        describe: 'Path to tls cert file',
        alias: 'c',
        default: 'cert.pem'
    })
    .option('key', {
        describe: 'Path to tls key file',
        alias: 'k',
        default: 'key.pem'
    })
    .help('h')
    .alias('h', 'help')
    .argv;
