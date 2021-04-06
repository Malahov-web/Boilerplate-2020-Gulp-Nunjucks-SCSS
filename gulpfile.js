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
// js
const   uglify = require('gulp-uglify');  // Подключаем Uglify
// const   uglify = require('gulp-uglify-es');  // Подключаем Uglify
// browser
const bs = require('browser-sync').create();  // Подключаем Browser Sync
const sourcemaps = require('gulp-sourcemaps');  // Подключаем Gulp Sourcemaps  ( создает карту, чтобы в инспекторе браузера показывать строку стиля в sass-файле   )
// files
const del = require('del'); // Подключаем библиотеку для удаления файлов и папок
const fs  = require('fs');
const data = require('gulp-data');
const concat = require('gulp-concat'); // Подключаем  Gulp Concat
const rename = require('gulp-rename');

const async = require('async');
const consolidate = require('gulp-consolidate');
const plumber = require('gulp-plumber');  // Преодхраняет остановку задачи из-за ошибки
// images
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const svgmin = require('gulp-svgmin');
// fonts
const iconfont = require('gulp-iconfont');
// emails
// const emailBuilder = require('gulp-email-builder');


// autoprefixer settings
// const autoprefixerOptions = {
//   browsers: ['last 10 versions', 'IE 10', 'IE 11']
// };   
// const autoprefixerOptions = require('./.browserslistrc');

// 2. Options

const styles = {
    'file_format' : 'scss'
}
const js = {
    'file_format' : 'js',
    'libs_path' : 'dev/libs/',
    'plugins' : [
        'libs_path' + '/jquery/dist/jquery.min.js',
        // 'libs_path' + '/another/dist/another.min.js', // placeholder
    ]
}
const js_jquery = js.libs_path + '/jquery/dist/jquery.min.js';

        // 'html'  : 'dev/_src/view/*.(html|njk)'
const paths = {
    'src_dir' :  'dev/_src',
    'dev_dir' :  'dev',
    'dist_dir':  'dist',

    // Файлы которые компилируются
    src: {
        'styles': 'dev/_src/scss/*.scss',
        'html'  : 'dev/_src/*.html',
        'js'    : 'dev/_src/js/*.js',
        'svg'   : 'dev/_src/images/svg/*.svg'
    },
    // Файлы которые отслеживаются (импортируемые)
    watch: {
        // 'styles': [ 'dev/_src/scss/**/*.scss', 'dev/_src/view/**/*.scss' ],
        'styles': [ 'dev/_src/scss/**/*.scss', 'dev/_src/view/**/*.' + styles.file_format +'' ],
        'html'  : ['dev/_src/*.html', 'dev/_src/view/**/*.html', 'dev/_src/data/**/*.json'],
        'js'    : ['dev/_src/js/*.js']
    }, 
    // Файлы для разработки в Gulp, для браузера   
    dev: {
        'styles': 'dev/css',
        'html'  : 'dev',
        'js'    : 'dev/js',
        // 'images': 'dev/images',
        'images':  'dev/images/',
        'uploads': 'dev/uploads',
        'svg'   : 'dev/images/svg/'
    },
    // Файлы готовые (чистые) для production
    dist: {
        'styles': 'dist/css',
        'html'  : 'dist',
        'js'    : 'dist/js',
        // 'images': 'dist/images',
        'images':  'dist/images/',
        'uploads': 'dist/uploads',        
    },

    clean: 'dist/*'
}

const pathsEmail = {
    // см. исходные файлы в yana.loc
    // Файлы которые компилируются
    src: {
        // 'styles': 'dev/_src/scss/*.scss',
        'styles': 'dev/_src/view/emails/**/*.scss',
        // 'styles': 'view/emails/**/*.scss',
        'html':   'dev/_src/view/emails/*.html'
    },
    dev: {
        'base': 'dev/emails',
        'styles': 'dev/_src/view/emails',
        'html': 'dev/emails',
    }

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

function jsDev (cb) {

    // body... 
    // return src([ paths.src.js, js_jquery] )
    return src([ 
            js_jquery,
            // some_lib,
            paths.src.js
        ])

        .pipe(concat('scripts.js'))
        .pipe(rename('scripts.min.js'))
        // .pipe(gulp.dest( paths.dev.js ));
        .pipe(dest(paths.dev.js)) // .pipe(dest('dev/css'))
        // .pipe(bs.stream()); // Отключено, чтобы не обновлялись страницы когда нужно сравнить
}
function jsBuild (argument) {
    // body... 
    return src(paths.dev.js + '/*.js')
        .pipe(uglify())
        .pipe(dest(paths.dist.js)) 
}

function imagesBuild (argument) {
    // body... 
    return src(paths.dev.images + '/**/*')
        .pipe(imagemin({ // Сжимаем с наилучшими настройками
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(dest(paths.dist.images))    
}
function uploadsBuild (argument) {
    // body... 
    return src(paths.dev.uploads + '/**/*')
        .pipe(imagemin({ // Сжимаем с наилучшими настройками
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(dest(paths.dist.uploads))    
}

function svgMin (argument) {
    // body... 
    return src(paths.src.svg) 
        .pipe(svgmin({
            plugins: [
                { removeDimensions: true },
                { cleanupListOfValues: true },
                { cleanupNumericValues: true }
            ]
        }))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace(/\ /g, "")
        }))
        .pipe(dest(paths.dev.svg));
}

const fontName = 'iconsFontName';
function iconFontMake (done) {
    // body... 
    // const iconStream = src([paths.dev.svg])
    const iconStream = src([paths.dev.svg + '*.svg'])
        .pipe(iconfont({
            fontName: fontName,
            formats: ['ttf', 'woff', 'svg', 'woff2'],
            fixedWidth: true,
            centerHorizontally: true,
            normalize: true,
            fontHeight: 1000
        }));

    // console.log('iconStream');
    // console.log(iconStream);

    async.parallel([
        function handleGlyphs(cb) {
            iconStream.on('glyphs', function (glyphs, options) {
                src('dev/_src/images/svgfontstyle/svgfontstyle.scss')

                    .pipe(consolidate('lodash', {
                        glyphs: glyphs,
                        fontName: fontName,
                        fontPath: '../fonts/',
                        className: fontName,

                    }))
                    .pipe(dest('dev/_src/scss/'))
                    .on('finish', cb);
            });
        },
        function handleFonts(cb) {
            iconStream
                .pipe(dest('dev/fonts/'+fontName+'/'))
                .on('finish', cb);
        }        
    // ], done);
    ]);

    // return; // -
    done();

}

// опции для разработки Emais
// var optionsEmailBuilder = { 
//     encodeSpecialChars: false, 

// };
// let nunjucksOptionsEmail = {
//     // path: [pathsEmail.dev.?],
//     path: ['dev/_src/view/emails/'],

// };
// let builder = emailBuilder(optionsEmailBuilder);
// function emailDev (argument) {
//     // body... 
//     // return gulp.src(pathsEmail.src.styles) // (!) .html  а Не .styles
//     return src(pathsEmail.src.html)

//         // Пробуем добавить компиляцию
//         .pipe(nunjucksRender(nunjucksOptionsEmail))
//         .pipe(beautify.html({ indent_size: 4 }))

//         .pipe(builder.build())
//         // .pipe(gulp.dest(path_base + 'view/emails'))            
//         // .pipe(gulp.dest(path_base + 'emails'))
//         .pipe(dest( pathsEmail.dev.html )) // Не совсем правильный путь
// }
// function emailStylesDev (argument) {
//     // return gulp.src(path_base + 'view/emails/**/*.scss')
//     // return gulp.src(pathsEmail.src.styles)
//     return src(pathsEmail.src.styles)

//         .pipe(sourcemaps.init())
//         .pipe(plumber())        
//         .pipe(sass())
//         .pipe(sourcemaps.write())      // .pipe(sourcemaps.write('.')) // ('.') - Выводит в отдельный файл
//         .pipe(dest(pathsEmail.dev.styles)) // .pipe(dest('dev/css'))
//         .pipe(bs.stream());

// }

// опции для тестовой рассылки  sendEmailTest()
// var current_date = new Date().toString();   
// var email_subject = 'Email Test Sending';    
// var optionsSend = { 
//     encodeSpecialChars: false, 

//     emailTest : {
//         // Your Email
//         from : 'malahovk@gmail.com',

//         to : 'malahovk@gmail.com,' + 
//             'hotice@lenta.ru,' +
//             'gafuroff.al@yandex.ru,' +
//             'pospelovasq@yandex.ru,' +
//             'site@malahov-web.com',                

//         // Your email Subject
//         subject : email_subject + ' [' + current_date + ']',

//         // Optional
//         transport: {
//             type: 'SMTP',
//             options: {
//                 service: 'gmail',
//                 auth: {
//                     user: 'malahovk@gmail.com',
//                     pass: "h',,bn"
//                 }
//             }
//         }
//     },        
// }; 
// // 3.10 sendEmailTest - 
// var emailTester = emailBuilder(optionsSend);
// function sendEmailTest (argument) {
//     // body... 
//     // return src(path_base+'emails/*.html')
//     return src( pathsEmail.dev.base +'/*.html')
//         .pipe(emailTester.sendEmailTest());
// }


function bsRun () {
    // body... 
    bs.init({
        server: "./dev"
    });
}


function watchRun () {
    // body... 
    // // watch('dev/_src/scss/*.scss', stylesDev);  // -  Так НЕ попадают импорты в подпапках
    // watch('dev/_src/scss/**/*.scss', stylesDev);  // +  Так следим за всеми файлами
    // watch('dev/_src/*.html', htmlDev);
    // // watch(paths.src.html, htmlDev);

    watch(paths.watch.styles, stylesDev);  // +  Так следим за всеми файлами
    watch(paths.watch.html, htmlDev);  // +  Так следим за всеми файлами
    watch(paths.watch.js, jsDev);  // +  


}
// function watchEmailRun (argument) {
//     // body... 
//     watch(pathsEmail.src.styles, emailStylesDev );  //    
//     // watch(paths.watch.html, htmlDev); // ..

//     // gulp.watch([path_base + 'view/emails/*.html', path_base + 'view/emails/**/*.scss'],  gulp.parallel('emailBuilder'));

//     // watch( [ pathsEmail.src.html, pathsEmail.src.styles ], emailBuilder ) // Вот так кажется в v4 Не работает
//     watch(  pathsEmail.src.html,  emailDev )
//     watch(  pathsEmail.src.styles , emailDev )
// }

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

exports.svgMin = svgMin;
exports.iconFontMake = iconFontMake;

// emails
// exports.emailStylesDev = emailStylesDev;
// exports.emailDev = emailDev;
// exports.sendEmailTest = sendEmailTest;

exports.watchRun = watchRun;
exports.bsRun = bsRun;
// exports.default = series(watchRun, bsRun, stylesDev);
exports.default = parallel(watchRun, bsRun, stylesDev, htmlDev);
// exports.defaultEmail = parallel(watchEmailRun, bsRun, emailStylesDev, emailDev)


exports.clean = clean;
exports.build = series(clean, stylesBuild, htmlBuild, jsBuild, imagesBuild, uploadsBuild)




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