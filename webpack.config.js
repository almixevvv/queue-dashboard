const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
	entry: './src/index.js',
	mode: 'development',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'ticket-bundle.js',
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'public'),
		},
		compress: true,
		port: 9000,
	},
	plugins: [new Dotenv()],
};
