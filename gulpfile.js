const gulp = require('gulp');
const del = require("del");
const $ = require('gulp-load-plugins')();
const pngquant = require('imagemin-pngquant');

const px2rpx = require("postcss-px2rpx");
const autoprefixer = require("autoprefixer");
const tsProject = $.typescript.createProject("tsconfig.json");

const composer = require("gulp-uglify/composer");
const uglifyES = require("uglify-es");
const minifyES = composer(uglifyES, console);

const pkg = require("./package.json");
// const jsonTransform = require("gulp-json-transform");

/* 文件路径 */
const PATH = {
  DIST: 'dist',
  WXML: 'src/**/*.wxml',
  LESS: ['src/**/!(_)*.less'],
  IMG: 'src/assets/images/*.{png,jpg,jpeg,gif,ico,svg}',
  JSON: 'src/**/*.json',
  TS: ['src/**/*.ts'],
  COPY: ['src/**/!(_)*.*', '!src/**/*.less', '!src/**/*.ts'],
};




const isProd = process.env.NODE_ENV === 'production';



/**
 * @description 清空非npm构建包dist目录文件
 */
gulp.task('clean', () => {
  return del(['dist/**/*', '!dist/miniprogram_npm/**']);
});

/**
 * @description 压缩wxml，生产环境任务
 * @options 去空，去注释，补全标签
 */
gulp.task('minify-wxml', () => {
  const options = {
    collapseWhitespace: true,
    removeComments: true,
    keepClosingSlash: true,
  };
  return gulp
    .src(PATH.WXML)
    .pipe($.if(isProd, $.htmlmin(options)))
    .pipe(gulp.dest(PATH.DIST));
});

/**
 * @description 压缩json，生产环境任务
 */
gulp.task('minify-json', function () {
  return gulp
    .src(PATH.JSON)
    .pipe($.jsonminify())
    .pipe(gulp.dest(PATH.DIST));
});

/**
 * @description 压缩图片，生产环境任务
 */
gulp.task('minify-image', () => {
  const options = {
    progressive: true,
    svgoPlugins: [
      {
        removeViewBox: false,
      },
    ],
    use: [pngquant()],
  };
  return gulp
    .src(PATH.IMG)
    .pipe($.imagemin(options))
    .pipe(gulp.dest('dist/assets/images/'))
});

/**
 * @description 编译less，补全、压缩样式文件
 */
gulp.task("compile-less", () => {
  const postcssOptions = [
    px2rpx({
      screenWidth: 750, // 设计稿屏幕, 默认750
      wxappScreenWidth: 750, // 微信小程序屏幕, 默认750
      remPrecision: 6 // 小数精度, 默认6
    }),
    autoprefixer({
      overrideBrowserslist: ["ios >= 8", "android >= 4.1"]
    })
  ];
  return gulp
    .src(PATH.LESS)
    .pipe(
      $.changed(PATH.DIST, {
        extension: ".wxss" // 编译前后文件名后缀如果发生改变，会全部重新编译，需要单独配置
      })
    )
    // .pipe($.plumber())
    .pipe($.if(!isProd, $.sourcemaps.init()))
    .pipe($.less())
    .pipe($.if(isProd, $.cssnano()))
    .pipe($.postcss(postcssOptions))
    .pipe($.if(!isProd, $.sourcemaps.write()))
    .pipe(
      $.rename({
        extname: ".wxss"
      })
    )
    .pipe(gulp.dest(PATH.DIST));
});

/**
 * @description 编译、压缩ts
 */
gulp.task("compile-ts", () => {
  const options = {
    compress: {
      drop_console: true,
      drop_debugger: true
    }
  };
  return tsProject
    .src() //!!!!!!
    .pipe(
      $.changed(PATH.DIST, {
        extension: ".js"
      })
    )
    // .pipe($.plumber())
    .pipe($.if(!isProd, $.sourcemaps.init()))
    // eslint() 将lint输出附加到“eslint”属性 以供其它模块使用
    // .pipe($.eslint())
    // format() 将lint结果输出到控制台。
    // .pipe($.eslint.format())
    .pipe(tsProject())
    .js.pipe($.if(isProd, minifyES(options)))
    .pipe($.if(!isProd, $.sourcemaps.write()))
    .pipe(gulp.dest(PATH.DIST));
});

/**
 * @description 复制不包含less和图片的文件
 */
gulp.task("copy-other", () => {
  return gulp
    .src(PATH.COPY)
    .pipe(gulp.dest(PATH.DIST));
});

/**
 * @description npm支持1，复制依赖的node_modules文件
 */
gulp.task("copy-node-modules", () => {
  const nodeModulesCopyPath = Object.keys(pkg.dependencies).map(
    d => "node_modules/" + d + "/**/*"
  );
  return gulp
    .src(nodeModulesCopyPath, {
      base: ".",
      allowEmpty: true
    })
    .pipe(gulp.dest(PATH.DIST));
});

// // /**
// //  * @description npm支持2，根据dependencies生成package.json
// //  */
// gulp.task("generate-package-json", () => {
//   return gulp
//     .src("./package.json")
//     .pipe(
//       jsonTransform(() => {
//         return {
//           dependencies: pkg.dependencies
//         };
//       })
//     )
//     .pipe(gulp.dest(PATH.DIST));
// });

/**
 * @description 通用编译
 */
gulp.task(
  "compile",
  gulp.series(
    "clean",
    gulp.parallel(
      "copy-node-modules",
      // "generate-package-json",
      "compile-ts",
      "compile-less",
      "copy-other"
    )
  )
);

/**
 * @description 编译、监听
 */
gulp.task(
  "watch",
  gulp.series(
    "compile",
    function wather() {
      gulp.watch(PATH.TS, gulp.parallel("compile-ts"));
      gulp.watch(PATH.LESS, gulp.parallel("compile-less"));
      gulp.watch(PATH.COPY, gulp.parallel("copy-other"));
      // $.watch("src/**", e => {
      //   console.log(`[watch]:${e.path} has ${e.event}`);
      // });
    }
  )
);

/**
 * @description 生产环境打包
 */
gulp.task(
  "build",
  gulp.series(
    "clean",
    gulp.parallel(
      "copy-node-modules",
      // "generate-package-json",
      "compile-ts",
      "compile-less",
      "copy-other",
      "minify-wxml", 
      "minify-json", 
      "minify-image"
    )
  )
);
