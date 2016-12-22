var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: {
		main: './index.js',
		vendor: 'jquery'
	},
	output: {
		filename: 'js/[name].bundle.js', //设置输出文件名
		chunkFilename: 'groupJs/[name].js', //设置分块文件名
		path: path.resolve(__dirname, 'dist/assets'), //设置文件输出目录的绝对路径
		publicPath: '/dist/assets/', //设置静态资源的访问路径,
		sourceMapFilename: 'map/[name].map', //设置映射文件名，跟devtool一起使用
		sourcePrefix: '\t', //给bundle资源的每一行前面加上这个字符串
		crossOriginLoading: false, //设置允许跨域加载chunks
	},
	module: {
		noParse: [/xx-module/], //忽略对已知某些模块的解析，可进一步加快速度
		rules: [ //资源转换
			{
				test: /\.css$/,
				loader: process.env.NODE_ENV !== 'production' ?
						'style-loader!css-loader!postcss-loader' : 
						ExtractTextPlugin.extract({
							fallbackLoader: 'style-loader',
							loader: 'css-loader!postcss-loader',
						})
			},
			{
				test: /\.js$/,
				include: path.resolve(__dirname, './'),
				exclude: /node_modules/,
				loader: "babel-loader",
				options: {
					presets: ["es2015"]
				}
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				loader: 'url-loader',
				query: {
					limit: 1000,
					name: 'img/[name].[hash:7].[ext]'
				}
			}
		],
	},
	resolve: {
		extensions: ['.js', '.json', '.css'], //设置require或import的时候可以不需要带后缀
		alias: { //设置路径别名
			"css": path.resolve(__dirname, 'assets/css/')
		}
	},
	plugins: [
		new webpack.LoaderOptionsPlugin({ //加载自定义项
	    	options: {
				postcss: function(){
					return [require('autoprefixer'), require('precss')];
				}, 
	    	}
	    }),
	],
	devtool: '#eval-source-map',
	devServer: {
	    historyApiFallback: true,
    	noInfo: true
	},
	externals: {
     	// "jquery": "jQuery"
 	},
	performance: { //控制台是否显示编译过程
    	hints: false,
    },
};

if(process.env.NODE_ENV === "production") {
	console.log('=================build=====================');

	module.exports.devtool = '#source-map';
	module.exports.plugins = (module.exports.plugins || []).concat([
		new webpack.DefinePlugin({ //定义开发环境或全局变量
			"process.env": {
				NODE_ENV: 'production'
			}
		}),
		new CleanWebpackPlugin(['dist/*'], { //清除
	        root:path.resolve(__dirname, '.'), // webpack.config的地址，一个根的绝对路径
	        verbose: true, // 将log写到 console.
	        dry: false, // 不要删除任何东西
	        // exclude: ['shared.js'] //排除不删除的目录
	    }),
	    
		new ExtractTextPlugin({ //提取css
	        filename:"css/com.css",
	        allChunks: true,
	        disable: false
	    }),
		new webpack.optimize.CommonsChunkPlugin({ //提取公共js
			names: ['vendor', 'manifest']
		}),
		new webpack.optimize.UglifyJsPlugin({ //压缩js
			compress: {
		        warnings: false
		    }
		}),
		new HtmlWebpackPlugin({ //生成html文件
			title: 'my app',
			template: './index.html', //模板文件
			filename: '../../index.html' //生成后的文件
		})
	]);
}