const path = require('path');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { EnvironmentPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const config = {
  target: 'electron-renderer',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build', 'web'),
    filename: '[name].bundle.js'
  },
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    // firewall: ['localhost', '127.0.0.1']
    allowedHosts: 'all',
    watchFiles: ['src/*'],
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { node: '14' } }],
              '@babel/preset-react'
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              // '@babel/plugin-proposal-export-default-from',
              // '@babel/plugin-transform-runtime',
              '@babel/plugin-syntax-dynamic-import',
              '@loadable/babel-plugin',
              // 'babel-plugin-macros',
              [
                'babel-plugin-styled-components',
                {
                  ssr: true,
                  pure: true
                }
              ],
              [
                'import',
                {
                  libraryName: 'antd',
                  style: true // or 'css'
                }
              ]
            ]
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.less$/i,
        use: [
          // compiles Less to CSS
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: {
                  'primary-color': '#365076',
                  'processing-color': '@primary-color',
                  'warning-color': '@gold-6',
                  'normal-color': '#1b2533',
                  'body-background': '@normal-color',
                  'text-color': 'fade(@white, 85%)',
                  'component-background': '#121929',
                  'font-family':
                    "'Inter', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
                  'code-family':
                    "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
                  'text-color-secondary': 'fade(@white, 45%)',
                  'icon-color-hover': 'fade(@white, 75%)',
                  'heading-color': 'fade(@white, 85%)',
                  'text-selection-bg': '@primary-6',
                  'border-color-base': '@component-background',
                  'border-color-split': '@component-background',
                  'item-hover-bg': '@normal-color',
                  'disabled-color': 'fade(@white, 25%)',
                  'disabled-color-dark': 'fade(@white, 35%)'
                }
              }
            }
          }
        ]
      },
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|webm|webp)/,
        type: 'asset/resource'
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      }
    ]
  },
  plugins: [
    // new BundleAnalyzerPlugin({
    //  analyzerMode: 'static',
    //  openAnalyzer: false,
    // }),
    new HtmlWebpackPlugin({
      template: 'public/index.html'
    }),
    new EnvironmentPlugin({
      // Automatically defined by webpack mode.
      // NODE_ENV: process.env.NODE_ENV || 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
      REACT_APP_RELEASE_TYPE: process.env.REACT_APP_RELEASE_TYPE || 'setup',
      SENTRY_DSN: process.env.SENTRY_DSN || ''
    })
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        parallel: true
      })
    ]
  }
};

module.exports = config;
