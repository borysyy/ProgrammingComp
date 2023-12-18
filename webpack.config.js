const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      // Rule for JS/JSX files
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      // Rule for Bootstrap CSS files
      {
        test: /\.(css)$/,
        include: /node_modules\/bootstrap/,
        use: [
          'style-loader', // Injects CSS into style tags in DOM
          'css-loader', // Parses and processes CSS
        ],
      },
      // Rule for your own CSS files
      {
        test: /\.css$/,
        exclude: /node_modules\/bootstrap/,
        use: [
          'style-loader', // Injects CSS into style tags in DOM
          'css-loader', // Parses and processes CSS
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
