// const path = require("path");

// const alias = {
//   app: path.resolve("./src/app/"),
//   common: path.resolve("./src/common/"),
//   ui: path.resolve("./src/ui/")
// };

const CracoAntDesignPlugin = require('craco-antd');

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
              node: '13'
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
      configure: {
        target:
          process.env.APP_TYPE === 'electron' ? 'electron-renderer' : 'web',
        optimization: {
          splitChunks: {
            name: false,
            cacheGroups: {
              vendor: {
                // sync + async chunks
                chunks: 'all',
                name: 'vendor',
                // import file path containing node_modules
                test: /node_modules/
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
      }
    },
    plugins: [
      {
        plugin: CracoAntDesignPlugin
      }
    ]
  };
};
