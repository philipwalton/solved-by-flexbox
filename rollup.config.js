import nodeResolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

const plugins = [
  nodeResolve(),
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(terser({module: true}));
}

export default {
  plugins,
  input: 'assets/main.js',
  output: {
    dir: 'solved-by-flexbox',
    format: 'esm',
  },
};
