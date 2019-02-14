import path from 'path';
import { Configuration, ProvidePlugin } from 'webpack';

const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.webpack.json'
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'eos-transit-oreid-provider.min.js',
    path: path.resolve(__dirname, 'umd'),
    libraryTarget: 'umd',
    library: ['WAL', 'providers', 'oreid'],
    libraryExport: 'default'
  },
  plugins: [
    new ProvidePlugin({
      'window.WAL': ['eos-transit', 'default'],
      'window.OreIdJS': ['@apimarket/oreid-js', 'default']
    })
  ],
  externals: {
    'eos-transit': 'WAL',
    '@apimarket/oreid-js': 'OreIdJS'
  },
  stats: {
    colors: true
  }
};

export default config;
