const gulp         = require('gulp');
const plumber      = require('gulp-plumber');
const rename       = require('gulp-rename');
const sourcemaps   = require('gulp-sourcemaps');
const eslint       = require('gulp-eslint');
const uglify       = require('gulp-uglify');
const babel        = require('gulp-babel');
const concat       = require('gulp-concat');
const cache        = require('gulp-cache');

/**
 * JS(ES) compile
 */
gulp.task('js', ()=>{
	gulp.src(['src/**/*.js'])
		.pipe(plumber({
			handleError: function (err) {
				console.log(err);
				this.emit('end');
			}
		}))
		.pipe(sourcemaps.init())
		.pipe(babel({presets: ['env']}))
		.pipe(eslint(
			{
				useEslintrc: false,
			})
		)
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
		.pipe(concat('genie'))
		// .pipe(uglify())
		.pipe(gulp.dest('dist'))
});

/**
 * watch files change
 */
gulp.task('watch', ()=>{
	gulp.watch('src/**/*.js',['js']);
});

/**
 * build & watch
 */
gulp.task('dev', ['js', 'watch']);

/**
 * build only (default))
 */
gulp.task('default', ['js']);
