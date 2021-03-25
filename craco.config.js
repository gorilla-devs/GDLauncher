// const path = require("path");

// const alias = {
//   app: path.resolve("./src/app/"),
//   common: path.resolve("./src/common/"),
//   ui: path.resolve("./src/ui/")
// };

/* eslint-disable no-param-reassign */

const CracoAntDesignPlugin = require('craco-antd');

module.exports = () => {
  // const isEnvDevelopment = env === 'development';
  // const isEnvProduction = env === 'production';

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
      configure: webpackConfig => {
        webpackConfig.target =
          process.env.APP_TYPE === 'electron' ? 'electron-renderer' : 'web';

        // webpackConfig.output = {
        //   filename: isEnvProduction
        //     ? 'static/js/[name].js'
        //     : isEnvDevelopment && 'static/js/bundle.js',
        //   chunkFilename: isEnvProduction
        //     ? 'static/js/[name].chunk.js'
        //     : isEnvDevelopment && 'static/js/[name].chunk.js'
        // };

        webpackConfig.optimization.splitChunks = {
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
        };
        webpackConfig.resolve.aliasFields = [];
        webpackConfig.resolve.mainFields = ['module', 'main'];
        return webpackConfig;
      }
    },
    plugins: [
      {
        plugin: CracoAntDesignPlugin
      }
    ]
  };
};
