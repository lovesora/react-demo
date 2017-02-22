'use strict';
import gulp from 'gulp';
import combiner from 'stream-combiner2';
import loadPlugins from 'gulp-load-plugins';
var $ = loadPlugins();


class Configs {
	constructor() {
		this.port = "8000";
		this.srcDir = "src/";
		this.distDir = "dist/";
		this.commonDir = `${this.distDir}common/`;
		this.concatJs = `${this.commonDir}js/`;

		this.html = `${this.srcDir}**/*.html`;
		this.reactjs = `${this.srcDir}**/*.js`;
	}
}
var configs = new Configs();


class Log {
	constructor(event) {
		this.path = $.watchPath(event, configs.srcDir, configs.distDir);

		console.log('\n');
		$.util.log($.util.colors.green(JSON.stringify(event.type)) + " " + this.path.srcPath);
	}

	cb(fn) {
		fn(this.path);

		gulp.src(this.path.srcPath)
			.pipe($.connect.reload());
	}
}


class CombinerErrHandler {
	common(err) {
		$.util.log($.util.colors.red(err));
	}

	react(err) {
		var colors = $.util.colors;
		$.util.log(colors.red('Error!'));
		$.util.log('fileName: ' + colors.red(err.fileName));
		$.util.log('plugin: ' + colors.yellow(err.plugin));


		$.util.log('cause: ' + colors.red(err));

		// $.util.log('lineNumber: ' + colors.red(err.cause.line));
		// $.util.log('colNumber: ' + colors.red(err.cause.col));
		// $.util.log('message: ' + err.cause.message);
	}
}


class Task {
	constructor() {
		this.combinerErrHandler = new CombinerErrHandler();
	}

	html(p) {
		combiner.obj([
			gulp.src(p.srcPath),
			$.sourcemaps.init(),
			$.htmlmin({
			collapseWhitespace: true,
			minifyJS: true
			}),
			$.sourcemaps.write('./'),
			gulp.dest(p.distDir)
		]).on('error', this.combinerErrHandler.common);
		return this;
	}

	react(p) {
		combiner.obj([
			gulp.src(p.srcPath),
			$.sourcemaps.init(),
			$.babel({
				"presets": ['es2015', 'react']
			}),
			$.concat('all.js'),
			gulp.dest(p.distDir),
			$.uglify(),
			$.rename(p => {
				p.extname = '.min.js';
			}),
			$.sourcemaps.write('./'),
			gulp.dest(p.distDir)
		]).on('error', this.combinerErrHandler.react)
		return this;
	}
}


// var log = event => {
// 	var path = $.watchPath(event, configs.srcDir, configs.distDir);

// 	console.log('\n');

// 	$.util.log("event: " + $.util.colors.green(event));
// 	$.util.log("path: " + path);

// 	this.cb = fn => {
// 		fn(path);
// 		gulp.src(path.srcPath)
// 			.pipe($.connect.reload());
// 	}
// 	return this;
// }


// var reactTask = p => {
// 	combiner.obj([
// 		gulp.src(p.srcPath),
// 		$.sourcemaps.init(),
// 		$.babel({
// 			"presets": ['es2015', 'react']
// 		}),
// 		$.concat('all.js'),
// 		gulp.dest(p.distDir),
// 		$.uglify(),
// 		$.rename(p => {
// 			p.extname = '.min.js';
// 		}),
// 		$.sourcemaps.write('./'),
// 		gulp.dest(p.distDir)
// 	]).on('error', new CombinerErrHandler().react)
// }

gulp.task('react', () => {;
})


gulp.task('watch', () => {
	gulp.watch(configs.reactjs, event => {
		new Log(event).cb(path => {
			new Task()
				.react({
					srcPath: configs.reactjs,
					distDir: configs.concatJs
				})
		});
	});

	gulp.watch(configs.html, event => {
		new Log(event).cb(path => {
			new Task()
				.html(path)
		})
	})
})

gulp.task('connect', () => {
	$.connect.server({
		port: configs.port,
		root: './',
		livereload: true
	});
})

gulp.task('init', () => {
	new Task()
		.html({
			srcPath: configs.html,
			distDir: configs.distDir
		})
		.react({
			srcPath: configs.reactjs,
			distDir: configs.concatJs
		})
});

gulp.task('default', ['connect', 'watch']);