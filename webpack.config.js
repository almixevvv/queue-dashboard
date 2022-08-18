const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
	entry: './src/index.js',
	mode: 'development',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'ticket-bundle.js'
	},
	plugins: [ new Dotenv() ]
};
