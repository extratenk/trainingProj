const { src, dest, watch, series } = require('gulp');

const del = require('del');
const sass = require('gulp-dart-sass');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const browsersync = require('browser-sync').create();
const include = require('gulp-file-include')

const BUILD_DIR = './prod';

function cleanTask() {
    return del([ BUILD_DIR ], { force: true });
}

function scssTask() {
    return src('sass/**/*.scss')
        .pipe(plumber())
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(autoprefixer({
            remove: false,
            browsers: [ 'last 2 versions' ]
        }))
        .pipe(rename('style.css'))
        .pipe(dest(`${ BUILD_DIR }/css`))
}

function jsTask() {
    return src('js/**/*.js')
        .pipe(dest(`${ BUILD_DIR }/scripts`))
}

function htmlTask() {
    return src('*.html')
        .pipe(include())
        .pipe(dest(`${ BUILD_DIR }`))
}

function fontsTask() {
    return src('fonts/**/*.*')
        .pipe(dest(`${ BUILD_DIR }/fonts`))
}

function imageTask() {
    return src('img/**/*.*')
        .pipe(dest(`${ BUILD_DIR }/images`))
}

function normalizeTask() {
    return src('css/normalize.css')
        .pipe(dest(`${ BUILD_DIR }/css`))
}

function browsersyncServe(cb) {
    browsersync.init({
        server: {
            baseDir: BUILD_DIR,
        },
    });
    cb();
}

function browsersyncReload(cb) {
    browsersync.reload();
    cb();
}

function watchTask() {
    watch('sass/**/*.scss', series(scssTask, browsersyncReload));
    watch('js/**/*.js', series(jsTask, browsersyncReload));
    watch('**/*.html', series(htmlTask, browsersyncReload));
    watch('img/**/*.*', series(imageTask, browsersyncReload));
}

const buildTask = series(
    cleanTask,
    normalizeTask,
    scssTask,
    jsTask,
    htmlTask,
    fontsTask,
    imageTask
)

exports.clean = cleanTask;
exports.build = buildTask;
exports.default = series(
    buildTask,
    browsersyncServe,
    watchTask
);
