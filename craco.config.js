// const path = require('path');

// const alias = {
//   app: path.resolve("./src/app/"),
//   common: path.resolve("./src/common/"),
//   ui: path.resolve("./src/ui/")
// };

const CracoAntDesignPlugin = require('craco-antd');
// eslint-disable-next-line
const webpack = require('webpack');
// const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
// const alias = require('./aliases');

// const aliases = alias();
// const resolvedAliases = Object.fromEntries(
//   Object.entries(aliases).map(([key, value]) => [
//     key,
//     path.resolve(__dirname, value)
//   ])
// );

/* eslint-disable */
const appTarget = process.env.APP_TYPE === 'web' ? 'browser' : 'desktop';

module.exports = ({ env }) => {
  const isEnvDevelopment = env === 'development';
  const isEnvProduction = env === 'production';

  return {
    babel: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets:
              process.env.APP_TYPE === 'web'
                ? 'defaults'
                : {
                    node: true
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
      configure: webpackConfig => {
        webpackConfig.optimization = {
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
        };
        Object.assign(webpackConfig.output, {
          filename: isEnvProduction
            ? 'static/js/[name].js'
            : isEnvDevelopment && 'static/js/bundle.js',
          chunkFilename: 'static/js/[name].chunk.js'
        });
        return webpackConfig;
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
          /(.*)_APP_TARGET_(\.*)/,
          resource => {
            resource.request = resource.request.replace(
              /_APP_TARGET_/,
              `${appTarget}`
            );
          }
        )
      ]
    },
    plugins: [
      {
        plugin: CracoAntDesignPlugin
      }
    ]
  };
};
