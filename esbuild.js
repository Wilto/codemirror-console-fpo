const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['_src/bundle.js'],
    outfile: '_site/bundle.js',
    bundle: true,
    minify: true,
    sourcemap: false,
    format: 'esm',
    define: {
      'process.env.NODE_DEBUG': "'Dev'"
    }
  })
  .then(() => console.log( 'JS built.' ))
  .catch(() => {
    process.exit(1);
  });