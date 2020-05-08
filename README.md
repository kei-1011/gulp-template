# gulptemplate

## npm 初期化

```
npm init
```


## プラグインをインストール


package.jsonからインストール

```
npm install
```

エラーが出たとき、管理者権限で実行する

```
sudo npm install

```




個別にインストール
```
npm install --save-dev gulp gulp-sass gulp-sourcemaps gulp-notify gulp-plumber gulp-postcss postcss-cssnext gulp-clean-css gulp-rename gulp-imagemin imagemin-mozjpeg imagemin-pngquant imagemin-svgo @babel/core @babel/preset-env gulp-babel gulp-uglify browser-sync css-mqpacker rimraf
```

## gulp 実行


```
gulp
```


## npm script から実行


```
$ npm run start
```



## buildタスクの実行

・distディレクトリの中身を全てクリーンにする
・サーバー立ち上げはせず、必要なファイルを全てコンパイルもしくは画像圧縮し直す

rimrafを入れる


```
$ npm run build
```

制作段階で蓄積されたファイル（もう使わない可能性のあるファイルも存在するかもしれないので）を一旦削除し、
今一度最新の環境でコンパイル＆画像圧縮したものを生成するという流れ


npm scriptは、
packege.jsonのscriptに記載する


```
  "scripts": {
  "clean": "rimraf dist/**/*",
  "start": "gulp",
  "build": "npm run clean && gulp build"
  },
```

rimrafのclean`dist`に出力してあるファイルを一旦全て削除。
buildでコンパイル、画像圧縮して再生成
