# http-serve-file

[![npm](https://img.shields.io/npm/v/http-serve-file)](https://www.npmjs.com/package/http-serve-file)
[![GitHub](https://img.shields.io/github/license/DCsunset/http-serve-file?color=blue)](https://github.com/DCsunset/http-serve-file)

Conveniently serve single file or specific files in a directory, based on Koa.js.

## Install

```
npm install http-serve-file
```

## Features

* Use sha256 of the file path as route to prevent conflicts.

## TODO

* [ ] Colored output
* [ ] Print all ip addresses
* [ ] Bind multiple addresses
* [ ] Print detailed logs

## Usage

To serve static file(s) via http or https.

```
http-serve-file <file(s)> [options]
```

Options:

* `--version`: Show version number [boolean]
* `--addr, -a`: Address to bind [default: "0.0.0.0"]
* `--port, -p`: Port to listen to [default: "8000"]
* `--tls`: Enable https [boolean]
* `-h, --help`: Show help [boolean]
* `-c, --cert`: Path to tls cert file [default: "cert.pem"]
* `-k, --key`: Path to tls key file [default: "key.pem"]
* `-h, --help`: Show help [boolean]

## License

MIT License
