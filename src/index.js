/* @flow */
import ExtractTextPlugin from "extract-text-webpack-plugin"
import path from "path"

type EasyLoaderObjectOptions = {
  [name: string]: (string | Object),
}
type EasyLoaderOptions = boolean | EasyLoaderObjectOptions
type EasyLoader = string | Array<string> | Object
type Loader = Object

export default (easyConfig: Object): Object => {
  const config: Object= { ...easyConfig }
  let loaders: Array<Loader> = []
  const cwd = process.cwd()
  const include = !config.include
    ? undefined
    : Array.isArray(config.include)
      ? config.include.map((p) => path.resolve(cwd, p))
      : path.resolve(cwd, config.include)

  // loop on keys to respect initial order
  Object.keys(config).forEach((key: string) => {
    switch (key) {

    case "include":
      // TODO validate path?
      break

    case "loaders":
      Object.keys(config.loaders).forEach((ext: string) => {
        const extLoaders: EasyLoader = config.loaders[ext]

        let loader
        if (typeof extLoaders === "string") {
          loader = extLoaders
        }
        else if (Array.isArray(extLoaders)) {
          loader = extLoaders.reverse().join("!")
        }
        else if (typeof extLoaders === "object") {
          loader = Object.keys(extLoaders)
          .map((loader: string) => {
            const query: EasyLoaderOptions = extLoaders[loader]
            if (query === true) {
              return loader
            }
            else if (typeof query === "object") {
              return (
                loader + "?" + (
                  Object.keys(query).map((name: string) => {
                    if (query[name] === true) {
                      return name
                    }
                    else if (typeof query[name] === "string") {
                      return name + "=" + query[name]
                    }
                    else if (typeof query[name] === "object") {
                      return name + "=" + JSON.stringify(query[name])
                    }
                    else {
                      throw new Error(
                        "Value passed to loader can only be true, a string, " +
                        "or an object that will be converted to JSON. " +
                        `'${ typeof query[name] }' not supported` +
                        query[name].toString()
                      )
                    }
                  })
                  .join("&")
                )
              )
            }
            else {
              throw new Error(
                "Only boolean, array and object are supported for loader " +
                "values. " +
                `'${ typeof query }' not supported for query: ` +
                query.toString()
              )
            }
          }).reverse().join("!")
        }
        else {
          throw new Error(
            "Only array and object are supported for loader list. " +
            `'${ typeof extLoaders }' not supported.`
          )
        }

        loaders.push({
          test: new RegExp(
            `\\.${ ext.indexOf("|") > -1 ? `(${ ext })` : ext }$`
          ),
          loader,
          // for later usage
          _ext: ext,
          include: include,
        })
      })
      delete config.loaders
      break

    case "module":
      if (config.module.loaders) {
        loaders = [ ...loaders, ...config.module.loaders ]
      }
      break
    }
  })

  const plugins: Array<Object> = config.plugins || []

  if (config.extract) {
    // adjust css loader
    loaders = loaders.map((loaderObject: Object) => {
      Object.keys(config.extract).forEach((key: string) => {
        const {
          filename,
          ...options,
        }: {
          filename: string,
          options: Object
        } = config.extract[key]

        if (loaderObject._ext === key) {
          const [
            firstLoader: string,
            ...loaders: Array<string>
          ] = loaderObject.loader.split("!")

          loaderObject = {
            ...loaderObject,
            loader: ExtractTextPlugin.extract(
              firstLoader,
              loaders
            ),
          }

          plugins.push(new ExtractTextPlugin(filename, options))
        }
      })

      return loaderObject
    })
  }

  return {
    ...config,
    module: {
      ...config.module,
      loaders,
    },
    plugins,
  }
}
