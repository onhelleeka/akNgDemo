'use strict';

var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var Manifest = require('manifest-revision-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

//ak
//var casual = require("casual");

var rootPublic = path.resolve('./src');
console.log("rootPublic is: ",rootPublic);
var NODE_ENV = process.env.NODE_ENV || "production";
var DEVELOPMENT = NODE_ENV === "production" ? false : true;
var stylesLoader = 'css-loader?root=' + rootPublic + '&sourceMap!postcss-loader!sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true';

const BowerResolvePlugin = require("bower-resolve-webpack-plugin");
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = function (_path) {
  var rootAssetPath = _path + 'src';

  var webpackConfig = {
    // entry points
    entry: {
      app: _path + '/src/app/index.bootstrap.js'
    },
    // output system
    output: {
      path: _path + '/dist',
      filename: '[name].js',
      publicPath: '/'
    },

    // resolves modules
    resolve: {
      /* plugins: [new BowerResolvePlugin()],
      modules: ['bower_components', 'node_modules'],
      descriptionFiles: ['bower.json', 'package.json'], */
      //mainFields: ['browser', 'main'],
      extensions: ['.js', '.es6', '.jsx', '.scss', '.css'],
      alias: {
        _appRoot: path.join(_path, 'src', 'app'),
        _images: path.join(_path, 'src', 'assets', 'images'),
        _stylesheets: path.join(_path, 'src', 'assets', 'styles'),
        _scripts: path.join(_path, 'src', 'assets', 'js'),
        //angular: '/../../node_modules/angular/angular.js'

      }
    },

    /* resolve: {
      plugins: [new BowerResolvePlugin()],
      modules: ['bower_components', 'node_modules'],
      descriptionFiles: ['bower.json', 'package.json'],
      mainFields: ['browser', 'main']
    }, */

    // modules resolvers
    module: {

      loaders: [
        { test: /[\/]angular\.js$/, loader: "exports?angular" }
      ],
      rules: [{
        test: /\.html$/,
        use: [
            {
              loader: 'ngtemplate-loader',
              options: {
                relativeTo: path.join(_path, '/src')
              }
            },
            {
              loader: 'html-loader',
              options: {
                attrs: ['img:src', 'img:data-src']
              }
            }
        ]
      }, {
        test: /\.js$/,
        exclude: [
          path.resolve(_path, "node_modules")
        ],
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader'
          }
        ]
      }, {
        test: /\.js$/,
        exclude: [
          path.resolve(_path, "node_modules")
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: false
            }
          },
          {
            loader: 'baggage-loader?[file].html&[file].css'
          }
        ]
      }, {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader?sourceMap'
          },
          {
            loader: 'postcss-loader'
          }
        ]
      }, {
        test: /\.(scss|sass)$/,
        loader: DEVELOPMENT ? ('style-loader!' + stylesLoader) : ExtractTextPlugin.extract({
          fallbackLoader: "style-loader",
          loader: stylesLoader
        })
      }, {
        test: /\.(woff2|woff|ttf|eot|svg)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: 'assets/fonts/[name]_[hash].[ext]'
            }
          }
        ]
      }, {
        test: /\.(jpe?g|png|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: 'assets/images/[name]_[hash].[ext]',
              limit: 10000
            }
          }
        ]
      }
      ]
    },

    // load plugins
    plugins: [
      new webpack.LoaderOptionsPlugin({
        options: {
          // PostCSS
          postcss: [autoprefixer({browsers: ['last 5 versions']})],
        }
      }),
      new WebpackShellPlugin({
        onBuildStart: ['echo "Starting"'],
        onBuildEnd: ['cp -r bower_components/angular-advanced-searchbox node_modules/.  && cp -r bower_components/bootstrap node_modules/. && ls']
      }),
       new webpack.ProvidePlugin({
           
           $: 'jquery',
           jQuery: 'jquery',
           'window.jQuery': 'jquery',
           'window.jquery': 'jquery', 
        /* new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            tether: 'tether',
            Tether: 'tether',
            'window.Tether': 'tether', */
        
           
           
           moment: 'moment',
           'window.moment': 'moment',
           
           
           _: 'lodash',
           'window._': 'lodash',
           
       }),
      new webpack.DefinePlugin({
        'NODE_ENV': JSON.stringify(NODE_ENV)
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.optimize.AggressiveMergingPlugin({
        moveToParents: true
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        async: true,
        children: true,
        minChunks: Infinity
      }),
      new Manifest(path.join(_path + '/config', 'manifest.json'), {
        rootAssetPath: rootAssetPath,
        ignorePaths: ['.DS_Store']
      }),
      new ExtractTextPlugin({
        filename: 'assets/styles/css/[name]' + (NODE_ENV === 'development' ? '' : '.[chunkhash]') + '.css',
        allChunks: true
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(_path, 'src', 'tpl-index.ejs')
      })
    ]
  };

  return webpackConfig;

};
