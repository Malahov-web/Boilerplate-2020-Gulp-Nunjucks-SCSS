// Gulpfile for Gulp v.4
/*
 * 1. Requires
 * 2. Config 
 * 3. Tasks 
 * 4. Calls 
 * 5. Utilites 
*/

// 1. Requires 

// const gulp = require('gulp');
// const { series } = require('gulp');
const { src, dest, series, parallel, watch } = require('gulp');
// styles
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
// html
const nunjucksRender = require('gulp-nunjucks-render'); 
const beautify = require('gulp-beautify');
//
const bs = require('browser-sync').create();  // Подключаем Browser Sync
const sourcemaps = require('gulp-sourcemaps');  // Подключаем Gulp Sourcemaps  ( создает карту, чтобы в инспекторе браузера показывать строку стиля в sass-файле   )
// files
const del = require('del'); // Подключаем библиотеку для удаления файлов и папок
const fs  = require('fs');
const data = require('gulp-data');

// autoprefixer settings
// const autoprefixerOptions = {
//   browsers: ['last 10 versions', 'IE 10', 'IE 11']
// };   
// const autoprefixerOptions = require('./.browserslistrc');

// 2. Options
        // 'html'  : 'dev/_src/view/*.(html|njk)'
const paths = {
    // Файлы которые компилируются
    src: {
        'styles': 'dev/_src/scss/*.scss',
        'html'  : 'dev/_src/*.html'
    },
    // Файлы которые отслеживаются (импортируемые)
    // watch: {
    //     'styles': 'dev/_src/scss/*.scss',
    //     'html'  : 'dev/_src/*.html'
    // }, 
    // Файлы для разработки в Gulp, для браузера   
    dev: {
        'styles': 'dev/css',
        'html'  : 'dev'
    },
    // Файлы готовые (чистые) для production
    dist: {
        'styles': 'dist/css',
        'html'  : 'dist'
    },

    clean: 'dist/*'
}


function stylesDev (cb) {

    // console.log('Gulp obj:');
    // console.log(gulp);
    // body... 
    return src('dev/_src/scss/*.scss')

        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())      // .pipe(sourcemaps.write('.')) // ('.') - Выводит в отдельный файл
        .pipe(autoprefixer())        
        .pipe(dest(paths.dev.styles)) // .pipe(dest('dev/css'))
        .pipe(bs.stream());

    cb();
}
function stylesBuild (argument) {
    // body... 
    // return src('dev/css/*.css')
    return src(paths.dev.styles + '/*.css')
        .pipe(cleanCSS({compatibility: 'ie11'}))
        // .pipe(rename({suffix: '.min'}))  // DO: Не забыть изменить путь подключаемого файла в html
        .pipe(dest(paths.dist.styles)) // .pipe(dest('dist/css'))
}

let nunjucksOptions = {
    // path: ['app/view/'], // - +
    path: ['dev/_src/view/'], // +
    // path: ['dev/_src/'], // + with extends "view/layout/_layout.html"
    // 
    // path: ['app/view/**/'], //
    // path: ['app/view/**.html'], // попробуем взять все файлы дял правильного кэширования
    // path: ['app/view/**/*.html'], // попробуем взять все файлы во всех подпапках
};


function htmlDev (cb) {
    // body... 
    return src(paths.src.html)
        .pipe(data(function (file) {
            // return JSON.parse(fs.readFileSync('./dev/data/data.json'));
            return JSON.parse(fs.readFileSync('./dev/_src/data/data.json'));
            // return JSON.parse(fs.readFileSync('./app/data/data.json'));
        }))
        // .pipe(nunjucksRender())
        .pipe(nunjucksRender(nunjucksOptions))        
        .pipe(beautify.html({ indent_size: 4 }))
        .pipe(dest(paths.dev.html))
        .pipe(bs.stream());
}
function htmlBuild (argument) {
    return src(paths.dev.html + '/*.html')
        // .pipe(gulp.dest('dist')) 
        // .pipe(gulp.dest('dist')) 
        .pipe(dest(paths.dist.html)) 
}

function bsRun () {
    // body... 
    bs.init({
        server: "./dev"
    });
}


function watchRun () {
    // body... 
    // watch('dev/_src/scss/*.scss', stylesDev);  // -  Так НЕ попадают импорты в подпапках
    watch('dev/_src/scss/**/*.scss', stylesDev);  // +  Так следим за всеми файлами
    watch('dev/_src/*.html', htmlDev);
    // watch(paths.src.html, htmlDev);
}

function clean () {
    // body...
    return del('dist'); 
}

function build () {
    // body... 
}

exports.stylesDev = stylesDev;
exports.stylesBuild = stylesBuild;
exports.htmlDev = htmlDev;
exports.htmlBuild = htmlBuild;

exports.watchRun = watchRun;
exports.bsRun = bsRun;
// exports.default = series(watchRun, bsRun, stylesDev);
exports.default = parallel(watchRun, bsRun, stylesDev, htmlDev);
exports.clean = clean;
exports.build = series(clean, stylesBuild, htmlBuild)




// const { series } = require('gulp');

// // The `clean` function is not exported so it can be considered a private task.
// // It can still be used within the `series()` composition.
// function clean(cb) {
//   // body omitted
//   cb();
// }

// // The `build` function is exported so it is public and can be run with the `gulp` command.
// // It can also be used within the `series()` composition.
// function build(cb) {
//   // body omitted
//   cb();
// }

// exports.build = build;
// exports.default = series(clean, build);