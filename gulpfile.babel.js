
import gulp from 'gulp';
import browserSync from 'browser-sync';
import minifyCSS from 'gulp-minify-css';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import autoprefixer from 'gulp-autoprefixer';
import sass from 'gulp-sass';
import fs from 'fs';
import uglify from 'gulp-uglify';

var gulpConfig = {
    prefixerScheme: ['> 1%', 'last 2 versions', 'Android >= 4.0', 'iOS >= 8'],
    cssWritePath: './build/css/',
    cssWidgetWritePath: './build/widgets/',
    jsWidgetWritePath: './build/widgets/',
    jsWritePath: './build/js/',
    bhScenesFileName: 'bh-scenes',
    skins: [
        'blue', 'colorE','green','lightBlue','purple'
    ]
};


////////////////////////////////////////
// browser-sync
////////////////////////////////////////
gulp.task('browser-sync', () => {
  browserSync({
    server: {
      baseDir: __dirname,
      index: 'index.html',
      directory: true
    },
    files: [],
    watchOptions: {
      //debounceDelay: 400
    },
    ghostMode: false,
    notify: false
  });
});





////////////////////////////////////////
// 编译样式
////////////////////////////////////////
gulp.task('style',['css-all', 'css-widget'], function () {
});

gulp.task('css-all', function () {
    var skins = gulpConfig.skins;
    var skinsLen = gulpConfig.skins.length;

    for(var k=0; k<skinsLen; k++){
        var skin = skins[k];
        var writePath = gulpConfig.cssWritePath + skin;
        gulp.src([
            './src/sass/skins/'+skin+'/*.scss',
            './src/sass/variable/*.scss',
            './src/sass/mixins/*.scss',
            './src/sass/bh/reset.scss',
            './src/sass/bh/utils.scss',
            './src/sass/bh/*.scss'
        ])
            .pipe(concat('bh-2.0.scss'))
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: gulpConfig.prefixerScheme
            }))
            .pipe(gulp.dest(writePath))
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(minifyCSS())
            .pipe(gulp.dest(writePath))
    }
});

gulp.task('css-widget', function () {
    var widgets = scanFolder('./src/widgets');
    var files = widgets.files;
    var filesLen=files.length;

    var skins = gulpConfig.skins;
    var skinsLen = gulpConfig.skins.length;
    for(var k=0; k<skinsLen; k++){
        var skin = skins[k];
        for(var i=0; i<filesLen; i++){
            var fileItem = files[i];
            if(!/\.scss$/.test(fileItem)){
                continue;
            }
            var srcList = [
                './src/sass/skins/'+skin+'/*.scss',
                './src/sass/variable/*.scss',
                './src/sass/mixins/*.scss',
                fileItem
            ];
            var fileName = fileItem.substring(fileItem.lastIndexOf('/')+1, fileItem.length);

            var fileNameIndex = fileItem.indexOf(fileName);
            var folderName = fileItem.substring(fileItem.lastIndexOf('/', fileNameIndex-2)+1, fileNameIndex-1);
            var writePath = gulpConfig.cssWidgetWritePath+folderName+'/'+skin;
            gulp.src(
                srcList
            )
                .pipe(concat(fileName))
                .pipe(sass().on('error', sass.logError))
                .pipe(autoprefixer({
                    browsers: gulpConfig.prefixerScheme
                }))
                .pipe(gulp.dest(writePath))
                .pipe(rename({suffix: '.min'}))
                .pipe(minifyCSS())
                .pipe(gulp.dest(writePath))
        }
    }

});


function scanFolder(path){
    var fileList = [],
        folderList = [],
        walk = function(path, fileList, folderList){
            var files = fs.readdirSync(path);
            files.forEach(function(item) {
                var tmpPath = path + '/' + item,
                    stats = fs.statSync(tmpPath);

                if (stats.isDirectory()) {
                    walk(tmpPath, fileList, folderList);
                    folderList.push(tmpPath);
                } else {
                    fileList.push(tmpPath);
                }
            });
        };

    walk(path, fileList, folderList);

    console.log('扫描' + path +'成功');

    return {
        'files': fileList,
        'folders': folderList
    }
}


gulp.task('script', ['js_all', 'js_widget'], function () {

});



gulp.task('js_all', function () {
    gulp.src([
        './src/js/bh.js',
        './src/widgets/**/*.js'
    ])
        .pipe(concat('bh-2.0.js'))    //合并所有js到bh.js
        .pipe(gulp.dest(gulpConfig.jsWritePath))       //输出到文件夹
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(uglify())    //压缩
        .pipe(gulp.dest(gulpConfig.jsWritePath));
});

gulp.task('js_widget', function () {
    var widgets = scanFolder('./src/widgets');
    var files = widgets.files;

    var filesLen=files.length;
    for(var i=0; i<filesLen; i++){
        var fileItem = files[i];
        if(!/\.js$/.test(fileItem)){
            continue;
        }
        var fileName = fileItem.substring(fileItem.lastIndexOf('/')+1, fileItem.length);

        var fileNameIndex = fileItem.indexOf(fileName);
        var folderName = fileItem.substring(fileItem.lastIndexOf('/', fileNameIndex-2)+1, fileNameIndex-1);
        gulp.src(
            fileItem
        )
            .pipe(gulp.dest(gulpConfig.jsWidgetWritePath+folderName))       //输出到文件夹
            .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
            .pipe(uglify())    //压缩
            .pipe(gulp.dest(gulpConfig.jsWidgetWritePath+folderName));
    }
});


gulp.task('watch-script', function () {
    //监听js文件,并编译
    gulp.watch(['./src/js/**/*.js', './src/widgets/**/*.js'], ['script']);
    gulp.watch(['./src/sass/**/*.scss', './src/widgets/**/*.scss'], ['style']);
});


gulp.task('default',['style', 'script', 'watch-script', 'browser-sync'], function () {
    gulp.watch([
        './build/**/*.{js,css,html}',
        './examples/**/*.{js,css,html}',
        './scenes/**/*.{js,css,html}',
        './docs/**/*.{js,css,html}'
    ]).on('change', function (changedFile) {
        gulp.src(changedFile.path)
            .pipe(browserSync.reload({
                stream: true,
                once: true
            }));
    });
});