/**
 * Webpack config for production electron main process
 */

const path = require('path');
// eslint-disable-next-line
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const baseConfig = {
  externals: [],

  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'native-ext-loader'
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [['@babel/preset-env', { targets: { node: '14' } }]],
            plugins: [
              '@babel/plugin-proposal-nullish-coalescing-operator',
              '@babel/plugin-proposal-optional-chaining'
            ]
          }
        }
      }
    ]
  },

  output: {
    path: path.join(__dirname, '..', 'build'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [path.join(__dirname, '..', 'build'), 'node_modules']
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_RELEASE_TYPE: process.env.REACT_APP_RELEASE_TYPE
    })
  ]
};

module.exports = merge(baseConfig, {
  devtool: 'eval-cheap-module-source-map',

  mode: process.env.NODE_ENV,

  target: 'electron-main',

  entry: './src/main/electron.js',

  output: {
    path: path.join(__dirname, '..'),
    filename: './build/electron.js'
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  },

  plugins: [
    new webpack.ExternalsPlugin('commonjs', [
      'leveldown',
      'murmur2-calculator',
      'nsfw'
    ]),
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV,
      DEBUG_PROD: false,
      START_MINIMIZED: false
    })
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  }
});
