import test from "ava"

import webpackEasyConfig from "../index"

import ExtractTextPlugin from "extract-text-webpack-plugin"

test("it should transform string loader", (t) => {
  const config = webpackEasyConfig({
    loaders: {
      "ext1|ext2": "file-loader",
    },
  })

  t.is(
    config.module.loaders[0].test.toString(),
    "/\\.(ext1|ext2)$/"
  )
  t.is(
    config.module.loaders[0].loader,
    "file-loader"
  )
})

test("it should transform array of loaders", (t) => {
  const config = webpackEasyConfig({
    loaders: {
      "ext": [ "whatever-loader", "file-loader" ],
    },
  })

  t.is(
    config.module.loaders[0].test.toString(),
    "/\\.ext$/"
  )
  t.is(
    config.module.loaders[0].loader,
    "file-loader!whatever-loader"
  )
})

test("it should transform object of loaders", (t) => {
  const config = webpackEasyConfig({
    loaders: {
      "css": {
        "postcss-loader": true,
        "css-loader": {
          modules: true,
          localIdentName: "[local]",
        },
        "style-loader": true,
      },
    },
  })

  t.is(
    config.module.loaders[0].test.toString(),
    "/\\.css$/"
  )
  t.is(
    config.module.loaders[0].loader,
    "style-loader!css-loader?modules&localIdentName=[local]!postcss-loader"
  )
})

test("it should be able to extract css", (t) => {
  const config = webpackEasyConfig({
    loaders: {
      "css": {
        "css-loader": true,
        "style-loader": true,
      },
    },
    extract: {
      css: {
        filename: "[name].[hash].css",
      },
    },
  })

  t.ok(
    config.module.loaders[0].loader
      .indexOf("/extract-text-webpack-plugin/") > -1,
  )

  t.ok(config.plugins[0] instanceof ExtractTextPlugin)
})

test("it should generate include option for loaders", (t) => {
  const config = webpackEasyConfig({
    include: "some/path",
    loaders: {
      "css": "some-loader",
    },
  })

  t.is(
    config.module.loaders[0].include,
    process.cwd() + "/some/path"
  )
})

test("it should generate absolute include option for loaders", (t) => {
  const config = webpackEasyConfig({
    include: "/some/path",
    loaders: {
      "css": "some-loader",
    },
  })

  t.is(
    config.module.loaders[0].include,
    "/some/path"
  )
})

test("it should generate array of include option for loaders", (t) => {
  const config = webpackEasyConfig({
    include: [ "some/path", "/some/other/path" ],
    loaders: {
      "css": "some-loader",
    },
  })

  t.same(
    config.module.loaders[0].include,
    [ process.cwd() + "/some/path", "/some/other/path" ]
  )
})
