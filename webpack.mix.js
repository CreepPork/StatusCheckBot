const mix = require('laravel-mix');

mix.webpackConfig({
    node: {
        __dirname: false,
        fs: 'empty',
    }
});

mix.ts('src/bot.ts', 'dist/')
    .setPublicPath('dist');
