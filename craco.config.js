// const path = require("path");

// const alias = {
//   app: path.resolve("./src/app/"),
//   common: path.resolve("./src/common/"),
//   ui: path.resolve("./src/ui/")
// };

const CracoAntDesignPlugin = require('craco-antd');
// eslint-disable-next-line
const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const alias = require('./aliases');

const aliases = alias();
const resolvedAliases = Object.fromEntries(
  Object.entries(aliases).map(([key, value]) => [
    key,
    path.resolve(__dirname, value)
  ])
);

/* eslint-disable */
const appTarget =
  process.env.NODE_ENV === 'development'
    ? 'Dev'
    : process.env.NODE_ENV === 'web'
    ? 'Web'
    : 'Electron';
/* eslint-enable */

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
              node: '14'
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
            parallel: true
          })
        ]
      },
      plugins: [
        new webpack.NormalModuleReplacementPlugin(
          /(.*)-APP_TARGET(\.*)/,
          resource => {
            // eslint-disable-next-line
            resource.request = resource.request.replace(
              /-APP_TARGET/,
              `-${appTarget}`
            );
          }
        )
      ],
      alias: resolvedAliases
    },
    plugins: [
      {
        plugin: CracoAntDesignPlugin
      }
    ]
  };
};
