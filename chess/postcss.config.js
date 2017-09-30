const plugins = {
  'postcss-import': {},
  'postcss-cssnext': {},
  'postcss-animation': {}
}

const isProd = process.env.NODE_ENV == 'production'
if (isProd)
  plugins['cssnano'] = {}

module.exports = {
  plugins
}
