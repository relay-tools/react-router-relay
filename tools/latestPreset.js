const babelPresetLatest = require('babel-preset-latest');

const { BABEL_ENV } = process.env;

module.exports = {
  presets: [
    [babelPresetLatest, {
      es2015: {
        loose: true,
        modules: BABEL_ENV === 'es' ? false : 'commonjs',
      },
    }],
  ],
};
