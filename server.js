#!/usr/bin/env node

const http = require('http');
const https = require('https');
const Koa = require('koa');
const send = require('koa-send');
const Router = require('koa-router');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const os = require('os');
const ipaddr = require('ipaddr.js');
const morgan = require('koa-morgan');

const app = new Koa();
const router = new Router();

// Immediate logger
app.use(morgan('combined', {
	immediate: true
}));
// Not immediate logger
app.use(morgan('combined'));

/**
 * Get ip addresses.
 * 
 * @param {*} ipv6 Display ipv6 addresses
 * @param {*} local Display local addresses
 */
function getIpAddresses(ipv6, local) {
    const ipAddresses = [];
    const networkInterfaces = os.networkInterfaces();
    for (const addresses of Object.values(networkInterfaces)) {
        for (const address of addresses) {
            if ((local || (!address.internal && !address.scopeid)) &&
                (address.family !== 'IPv6' || ipv6)) {
                // Bypass internal and link-local address, and ipv6 address if ipv6 is true
                ipAddresses.push(address);
            }
        }
    }
    return ipAddresses;
}

require('yargs')
    .command('$0 <file(s)> [options]', 'Serve static file(s) via http or https. (Double dots in file names are invalid)', () => {}, argv => {
        const files = argv._.concat([argv['file(s)']]);
        const protocol = argv.tls ? 'https' : 'http';

        const addr = ipaddr.parse(argv.addr)

        const ipAddresses = addr.toString() === '::' ? getIpAddresses(true, argv.local) :
            addr.toString() === '0.0.0.0' ? getIpAddresses(false, argv.local) : [argv.addr];

        for (const file of files) {
            const sha256 = crypto.createHash('sha256');
            const route = sha256.update(file).digest('hex').substring(0, 8);
            const filename = file.substring(file.lastIndexOf('/') + 1);
            const encodedFilename = encodeURIComponent(escape(filename));

            router.get(`/${route}/${encodedFilename}`, async ctx => {
                await send(ctx, path.resolve(file), {
                    root: '/', // Serve all files
                    hidden: true
                });
            });

            console.log(`Serving ${file} at:`);
            for (const ip of ipAddresses) {
                const host = ip.family === 'IPv6' ? `[${ip.address}]` : ip.address;
                console.log(`\t${protocol}://${host}:${argv.port}/${route}/${encodedFilename}`);
            }
            console.log();
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
        default: '::'
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
    .option('local', {
        describe: 'Display local addresses',
        alias: 'l',
        type: 'boolean'
    })
    .help('h')
    .alias('h', 'help')
    .argv;
