/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';

export default {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  },

  output: {
    path: path.join(__dirname, '..', 'app'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      app: path.resolve(__dirname, '..', 'app/'),
      components: path.resolve(__dirname, '..', 'app/components-new/'),
      ui$: path.resolve(__dirname, '..', 'ui/index.js'),
      reducers: path.resolve(__dirname, '..', 'app/reducers/')
    }
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),

    new webpack.NamedModulesPlugin()
  ]
};
