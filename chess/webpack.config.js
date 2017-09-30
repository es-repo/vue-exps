const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = function (env) {
  const isProd = env && env.production
  process.env.NODE_ENV = isProd ? 'production' : 'development'

  const outDir = path.resolve(__dirname, 'dist', isProd ? 'prod' : 'dev')
  const outFile = isProd
    ? '[name].[chunkhash:4].js'
    : '[name].js'

  return {

    entry: {
      index: './src/index.js'
    },

    output: {
      filename: outFile,
      path: outDir
    },

    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            cssModules: {
              localIdentName: '[local]-[hash:base64:5]',
              camelCase: true
            },
            preserveWhitespace: false,
            extractCSS: isProd,
            transformToRequire: { img: 'src', image: 'xlink:href', object: 'data', use: 'href' }
          }
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader', options: {
                  importLoaders: 1
                }
              },
              'postcss-loader']
          })
        },
        {
          test: /\.svg$/,
          use: {
            loader: 'vue-svg-loader'
          }
        },
        {
          test: /(\.(png|woff|woff2|mp3)$)/,
          use: {
            loader: 'file-loader',
            options: { name: '[name].[ext]' }
          }
        }
      ]
    },

    plugins: [
      new CleanPlugin([outDir]),

      new HtmlPlugin({
        template: 'src/index.html'
      }),

      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module) {
          // Prevent moving stylsheets to vendor chunk
          if (module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
            return false
          }
          return module.context && module.context.indexOf('node_modules') !== -1
        }
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'runtime'
      }),

      // For generating stable (name-based) module ids.
      new webpack.NamedModulesPlugin(),

      // For generating friendly webpack log messages in console
      new FriendlyErrorsWebpackPlugin(),

      //new BundleAnalyzerPlugin(),

      new ExtractTextPlugin({
        filename: '[name].[contenthash:4].css',
        disable: !isProd
      }),

      ...isProd
        ? [
          new webpack.optimize.UglifyJsPlugin({
            parallel: true
          })
        ]
        : [
          new webpack.SourceMapDevToolPlugin({
            exclude: ['vendor.js', 'runtime.js']
          })
        ]
    ]
  }
}
