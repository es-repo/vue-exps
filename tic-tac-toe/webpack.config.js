const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

module.exports = function () {
  const outputDir = 'dist'

  return {

    entry: {
      scripts: './src/main.js'
    },

    output: {
      filename: '[name].js',
      path: path.join(__dirname, outputDir)
    },

    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: { preserveWhitespace: false }
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /(\.(png|woff2|svg)$)/,
          use: {
            loader: 'file-loader',
            options: { name: '[name].[ext]' }
          }
        },
        {
          test: /manifest\.json/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]'
              }
            },
            {
              loader: 'webmanifest-loader'
            }
          ]
        }
      ]
    },

    plugins: [
      new FriendlyErrorsWebpackPlugin(),
      new CleanWebpackPlugin([outputDir]),

      new SWPrecacheWebpackPlugin(
        {
          cacheId: 'tic-tac-toe',
          minify: true,
          staticFileGlobsIgnorePatterns: [/\.map$/, /manifest\.json$/],
        }
      ),

      new HtmlWebpackPlugin({
        template: 'src/index.html'
      })
    ],

    devtool: 'eval-source-map'
  }
}
