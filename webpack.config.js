import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

import path from 'path';


const assetPath = path.join(__dirname, 'dist');

const resolve = {
	resolve: {
		extensions: ['', '.js', '.jsx'],
		alias: {
			'actions': __dirname + '/src/actions/',
			'components': __dirname + '/src/components/',
			'constants': __dirname + '/src/constants/',
			'reducers': __dirname + '/src/reducers/',
			'themes': __dirname + '/src/public/themes',
			'images': __dirname + '/src/public/images'
		}
	},
	resolveLoader: {
		root: path.join(__dirname, '../node_modules')
	},
};

const lintLoaders = {
	preLoaders: [{
		test: /\.js$/,
		exclude: [/node_module/, 'mock/*'],
		loader: 'eslint'
	}],
};

const jsLoaders = {
	test: /\.js$/,
	exclude: /node_modules/,
	loader: 'babel'
};

const loaders = [{
	test: /\.scss/,
	exclude: [/node_module/],
	loader: 'style!css?module&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss'
}, {
	test: /\.css/,
	exclude: [/node_module/],
	loader: 'style!css'
}, {
	test: /\.less$/,
	loader: ExtractTextPlugin.extract(
		'css?sourceMap!' +
		'autoprefixer-loader!' +
		'less?{"sourceMap":true,"modifyVars":' + JSON.stringify({}) + '}'
	)
}, {
	test: /\.(png|jpg|woff|woff2)$/,
	loader: 'url?limit=8192'
}];

const plugins = {
	development: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			__DEVELOPMENT__: true,
			__DEVTOOLS__: true
		}),
		new ExtractTextPlugin('[name].css', {
			disable: false,
			allChunks: true
		}),
		new HtmlWebpackPlugin({
			template: 'src/index.html.tpl',
			inject: 'body'
		})
	],

	production: [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		}),
		new webpack.DefinePlugin({
			__DEVELOPMENT__: false,
			__DEVTOOLS__: false
		}),
		new ExtractTextPlugin('[name]-[contenthash].css', {
			disable: false,
			allChunks: true
		}),
		new webpack.optimize.CommonsChunkPlugin('common', 'common-[hash].js'),

		new HtmlWebpackPlugin({
			template: 'src/index.html.tpl',
			inject: 'body',
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				conservativeCollapse: true,
				preserveLineBreaks: true
			}
		})
	]
};

const development = {
	output: {
		path: assetPath,
		filename: 'main.js',
		publicPath: '/'
	},
	cache: true,
	debug: true,
	devtool: "#inline-source-map",
	entry: [
		'webpack-hot-middleware/client',
		'./src/index.js'
	],
	stats: {
		colors: true,
		reasons: true
	},
	...resolve,
	module: {
		// ...lintLoaders,
		loaders: [{
				...jsLoaders,
				query: {
					plugins: ['react-transform'],
					extra: {
						'react-transform': {
							transforms: [{
								transform: 'react-transform-hmr',
								imports: ['react'],
								locals: ['module']
							}, {
								transform: 'react-transform-catch-errors',
								imports: ['react', 'redbox-react']
							}]
						}
					}
				}
			},
			...loaders
		]
	},

	plugins: plugins.development
};

const production = {
	output: {
		path: assetPath,
		filename: 'main-[hash].js',
    chunkFilename:'[name]-[chunkhash].js',
		publicPath: '/',
		jsonpFunction: 'Ant'

	},
	devtool: 'sourcemap',
	entry: [
		'./src/index.js'
	],
	...resolve,
	module: {
		...lintLoaders,
		loaders: [{
				...jsLoaders,
			},
			...loaders
		]
	},

	plugins: plugins.production
};


export {
	development, production
}
