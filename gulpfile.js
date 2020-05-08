const { src, dest, watch, series, parallel } = require('gulp');

//scss
const sass = require('gulp-sass');
const plumber = require("gulp-plumber");    // エラーが発生しても強制終了させない
const notify = require("gulp-notify");      // エラー発生時のアラート出力
const postcss = require("gulp-postcss");    // PostCSS利用
const cssnext = require("postcss-cssnext")  // CSSNext利用
const cleanCSS = require("gulp-clean-css"); // 圧縮
const rename = require("gulp-rename");      // ファイル名変更
const sourcemaps = require("gulp-sourcemaps");  // ソースマップ作成
const mqpacker = require('css-mqpacker');     //メディアクエリをまとめる

//js babel
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");

//画像圧縮
const imagemin = require("gulp-imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const imageminSvgo = require("imagemin-svgo");

//ファイル監視
const browserSync = require("browser-sync");


//postcss-cssnext ブラウザ対応条件 prefix 自動付与
const browsers = [
  'last 2 versions',
  '> 5%',
  'ie = 11',
  'not ie <= 10',
  'ios >= 8',
  'and_chr >= 5',
  'Android >= 5',
]

//参照元パス
const srcPath = {
  css: 'src/scss/**/**.scss',
  js: 'src/js/*.js',
  img: 'src/img/**/*',
  php: './**/*.php',
  html: './**/*.php',
}

//出力先パス
const destPath = {
  css: 'dist/css/',
  js: 'dist/js/',
  img: 'dist/img/'
}


//sass
const cssSass = () => {
  return src(srcPath.css) //コンパイル元
    .pipe(sourcemaps.init())//gulp-sourcemapsを初期化
    .pipe(
      plumber(              //エラーが出ても処理を止めない
        {
          errorHandler: notify.onError('Error:<%= error.message %>')
          //エラー出力設定
        }
      )
    )
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(postcss([mqpacker()])) // メディアクエリを圧縮
    .pipe(postcss([cssnext(browsers)]))//cssnext
    .pipe(sourcemaps.write('/maps'))  //ソースマップの出力
    .pipe(dest(destPath.css))         //コンパイル先
    .pipe(cleanCSS()) // CSS圧縮
    .pipe(
      rename({
        extname: '.min.css' //.min.cssの拡張子にする
      })
  )
}


// babelのトランスパイル、jsの圧縮
const jsBabel = () => {
  return src(srcPath.js)
    .pipe(
      plumber(              //エラーが出ても処理を止めない
        {
          errorHandler: notify.onError('Error: <%= error.message %>')
        }
      )
    )
    .pipe(babel({
      presets: ['@babel/preset-env']  // gulp-babelでトランスパイル
    }))
    .pipe(dest(destPath.js))
    .pipe(uglify()) // js圧縮
    .pipe(
      rename(
        { extname: '.min.js' }
      )
    )
    .pipe(dest(destPath.js))
}

//画像圧縮（デフォルトの設定）
const imgImagemin = () => {
  return src(srcPath.img)
    .pipe(
      imagemin(
        [
          imageminMozjpeg({
            quality: 80
          }),
          imageminPngquant(),
          imageminSvgo({
            plugins: [
              {
                removeViewbox: false
              }
            ]
          })
        ],
        {
          verbose: true
        }
      )
    )
    .pipe(dest(destPath.img))
}


//ローカルサーバー立ち上げ、ファイル監視と自動リロード
const browserSyncFunc = () => {
  browserSync.init(browserSyncOption);
}
const browserSyncOption = {
  proxy: 'http://localhost/',       //環境によって変更する
  open: true,
  reloadOnRestart: true,
}

//リロード
const browserSyncReload = (done) => {
  browserSync.reload();
  done();
}

//ファイル監視
const watchFiles = () => {
  watch(srcPath.css, series(cssSass, browserSyncReload))
  watch(srcPath.js, series(jsBabel, browserSyncReload))
  watch(srcPath.img, series(imgImagemin, browserSyncReload))
  watch(srcPath.php, series(browserSyncReload))
  watch(srcPath.html, series(browserSyncReload))
}

exports.default = series(series(cssSass, jsBabel, imgImagemin), parallel(watchFiles, browserSyncFunc));
exports.build = series(cssSass, jsBabel, imgImagemin);
