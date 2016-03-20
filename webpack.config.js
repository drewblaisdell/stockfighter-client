module.exports = {
  context: __dirname + '/app',
  entry: {
    javascript: './index.js',
    html: './index.html',
  },

  output: {
    filename: 'index.js',
    path: __dirname + '/dist'
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]'
      }
    ]
  },
  resolve: {
    extensions: [ '', '.json', '.js', '.jsx' ]
  }
};
