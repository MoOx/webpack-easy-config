# webpack-easy-config

[![Unix Build status](https://img.shields.io/travis/MoOx/webpack-easy-config/master.svg?branch=master&label=unix%20build)](https://travis-ci.org/MoOx/webpack-easy-config)
[![Code Coverage](https://img.shields.io/coveralls/MoOx/webpack-easy-config/master.svg)](https://coveralls.io/github/MoOx/webpack-easy-config)
[![Version](https://img.shields.io/npm/v/webpack-easy-config.svg)](https://github.com/MoOx/webpack-easy-config/blob/master/CHANGELOG.md)
[![Support on gitter chat](https://img.shields.io/badge/support-gitter%20chat-E40255.svg)](https://gitter.im/MoOx/webpack-easy-config)

> Webpack config, made easy

Ideas:

- simpler config
- fix loaders order (imo, more logical order): proof is that
  [most webpack users don't get this part](https://twitter.com/MoOx/status/710400696449933313)
- no tons of way to provide config via string, query etc
- some shortcuts: simple extract, aliases

Note that you can provide normal configuration before or after special keys handled by this package. Order should be respected.

## Installation

```console
$ npm install webpack-easy-config
```

## Usage

```js
import webpackEasyConfig from "webpack-easy-config"

export default webpackEasyConfig({
  include: "src", // relative to process.cwd(), or can be absolute
  // can also be an array like
  // include: [ "src", "web_modules" ],
  loaders: {
    css: {
      "postcss-loader": true,
      "css-loader": {
        modules: true,
        localIdentName: "[path][name]--[local]--[hash:base64:5]",
      },
      "style-loader": true,
    },
    "html|ico|jpe?g|png|gif": {
      "file-loader": {
        name: "[path][name].[ext]",
        context: "src",
      },
    },
    "svg": [ "svgo-loader", "raw-loader" ],
    "woff2|woff|ttf|eot": "file-loader",
  },
  extract: {
    css: {
      filename: "[name].[hash].css",
      disable: process.argv.indexOf("--dev") > -1,
    },
  },
})
```

Will generate the equivalent config

```js
export default {
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          "style-loader",
          "css-loader" +
            "?modules" +
            "&localIdentName=[path][name]--[local]--[hash:base64:5]" +
          "!postcss-loader!"
        ),
        include: `/absolute/path/to/src`,
      },
      {
        test: /\.(html|ico|jpe?g|png|gif)$/,
        loader:
          "file-loader" +
          "?name=[path][name].[ext]" +
          "&context=src",
        include: `/absolute/path/to/src`,
      },
      {
        test: /\.svg$/,
        loader: "raw-loader!svgo-loader",
        include: `/absolute/path/to/src`,
      },
      {
        test: /\.(woff2|woff|ttf|eot)$/,
        loader: "file-loader",
        include: `/absolute/path/to/src`,
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin("[name].[hash].css", {
      disable: process.argv.indexOf("--dev") > -1
    })
  ],
}
```

---

## CONTRIBUTING

* ⇄ Pull requests and ★ Stars are always welcome.
* For bugs and feature requests, please create an issue.
* Pull requests must be accompanied by passing automated tests (`$ npm test`).

## [CHANGELOG](CHANGELOG.md)

## [LICENSE](LICENSE)
