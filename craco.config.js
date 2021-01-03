// const path = require("path");

// const alias = {
//   app: path.resolve("./src/app/"),
//   common: path.resolve("./src/common/"),
//   ui: path.resolve("./src/ui/")
// };

const CracoAntDesignPlugin = require('craco-antd');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = ({ env }) => {
  const isEnvDevelopment = env === 'development';
  const isEnvProduction = env === 'production';

  return {
    babel: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: '15'
            }
          }
        ],
        '@babel/react'
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-transform-runtime',
        '@babel/plugin-syntax-dynamic-import',
        '@loadable/babel-plugin',
        'babel-plugin-macros',
        [
          'babel-plugin-styled-components',
          {
            ssr: true,
            pure: true
          }
        ]
      ]
    },
    webpack: {
      devtool: 'eval-cheap-module-source-map',
      configure: {
        devtool: 'eval-cheap-module-source-map',
        target:
          process.env.APP_TYPE === 'electron' ? 'electron-renderer' : 'web',
        optimization: {
          splitChunks: {
            name: false,
            chunks: 'all',
            maxInitialRequests: Infinity,
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]!(antd)/,
                name(module) {
                  // get the name. E.g. node_modules/packageName/not/this/part.js
                  // or node_modules/packageName
                  const packageName = module.context.match(
                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                  )[1];

                  // npm package names are URL-safe, but some servers don't like @ symbols
                  return `npm.${packageName.replace('@', '')}`;
                }
              }
            }
          }
        },
        output: {
          filename: isEnvProduction
            ? 'static/js/[name].js'
            : isEnvDevelopment && 'static/js/bundle.js',
          chunkFilename: isEnvProduction
            ? 'static/js/[name].chunk.js'
            : isEnvDevelopment && 'static/js/[name].chunk.js'
        }
      },
      optimization: {
        minimizer: [
          new TerserPlugin({
            parallel: true,
            sourceMap: true,
            cache: true
          })
        ]
      }
    },
    plugins: [
      {
        plugin: CracoAntDesignPlugin
      }
    ]
  };
};
