/*
src 参照元を指定
dest 出力さきを指定
watch ファイル監視
series(直列処理)とparallel(並列処理)
*/
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

//ftpアップロード
const ftp = require("vinyl-ftp");

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


//ローカルサーバー立ち上げ
const browserSyncFunc = () => {
  browserSync.init(browserSyncOption);
}
const browserSyncOption = {
  proxy: 'http://localhost/template/gulp-template/',       //環境によって変更する
  open: true,
  watchOptions: {
    debounceDelay: 1000
  },
  reloadOnRestart: true,
}

//リロード処理を実行する関数
const browserSyncReload = (done) => {
  browserSync.reload();
  done();
}

// アカウント情報の定義
const connect = ftp.create({
  host: '********',
  user: '********',
  password: '********',
})

// アップロードするファイルパス
const ftpUploadFiles = [
  'dist/**',
  'dist/css/**',
  'dist/js/**',
  'dist/img/**',
  'index.html'
]

// アップロード先ディレクトリパス
const remoteDistDir = '/'

const vinylFtp = () => {
  return src(ftpUploadFiles, { buffer: false })
  .pipe(connect.newerOrDifferentSize(remoteDistDir))
  .pipe(connect.dest(remoteDistDir))
}


//ファイルの変更を監視
const watchFiles = () => {
  watch(srcPath.css, series(cssSass, browserSyncReload))
  watch(srcPath.js, series(jsBabel, browserSyncReload))
  watch(srcPath.img, series(imgImagemin, browserSyncReload))
  watch(srcPath.php, series(browserSyncReload))
}

//処理をまとめて実行

//gulp default
exports.default = series(series(cssSass, jsBabel, imgImagemin), parallel(watchFiles, browserSyncFunc));
//gulp build
exports.build = series(cssSass, jsBabel, imgImagemin)
exports.ftp = series(vinylFtp)
