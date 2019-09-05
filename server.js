const http = require('http');
const https = require('https');
const Koa = require('koa');
const send = require('koa-send');
const Router = require('koa-router');
const fs = require('fs');

const app = new Koa();
const router = new Router();

require('yargs')
    .command('$0 <file(s)> [options]', 'Serve static file(s) via http or https. (Double dots in file names are invalid)', () => {}, argv => {
        const files = argv._.concat([argv['file(s)']]);
        const protocol = argv.tls ? 'https' : 'http';
        for (const file of files) {
            router.get(`/${file}`, async ctx => {
                await send(ctx, file, { hidden: true });
            });
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

        // Log
        for (const file of files) {
            console.log(`Serving ${file}`);
            console.log(`Serving at ${protocol}://${argv.addr}:${argv.port}/${file}\n`);
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
