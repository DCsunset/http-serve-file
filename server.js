const http = require('http');
const https = require('https');
const Koa = require('koa');
const path = require('path');
const send = require('koa-send');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

require('yargs')
    .command('$0 <file(s)> [options]', 'Serve static file(s) via http or https.', () => {}, argv => {
        for (const file of argv._) {
            router.get(`/${file}`, async ctx => {
                await send(ctx, file, { hidden: true });
            });
            console.log(`Serving ${file}`);
            console.log(`Serving at http://${argv.addr}:${argv.port}/${file}\n`);
        }
        app.use(router.routes());
        app.use(router.allowedMethods());

        if (!argv.https) {
            http.createServer(app.callback()).listen(argv.port, argv.addr);
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
    .option('https', {
        describe: 'Enable https',
        default: false
    })
    .help('h')
    .alias('h', 'help')
    .argv;
