const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

require("dotenv").config();

const SOURCE_FOLDER = "src";
const BUILD_FOLDER = "build";

const webpackConfigFn = (env) => {
  if (!env.BUILD_ENV) {
    throw new Error("Please set Webpack environment variable 'BUILD_ENV'.");
  }

  console.log(`env.BUILD_ENV = '${env.BUILD_ENV}'`);

  let buildSettingsConfig = "";
  switch (env.BUILD_ENV) {
    case "prod":
      buildSettingsConfig = "prod-build.js";
      break;
    case "local":
      buildSettingsConfig = "local-build.js";
      break;
    default:
      throw new Error("Webpack environment variable 'BUILD_ENV' can be one of `prod` or `local`.");
  }
  const buildSettings = require(path.join(__dirname, "configs", "webpack", buildSettingsConfig));

  const webpackConfig = {
    entry: path.join(__dirname, SOURCE_FOLDER, "index.tsx"),
    output: {
      path: path.join(__dirname, BUILD_FOLDER),
      filename: "[name].js",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: "ts-loader",
          options: {
            context: __dirname,
          },
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js", ".json", ".tsx"],
    },
    plugins: [
      new webpack.DefinePlugin((() => {
        const reactAppEnv = {};
        const processEnvKeys = Object.keys(process.env);

        for (let i = 0; i < processEnvKeys.length; i += 1) {
          const key = processEnvKeys[i];
          const val = process.env[key];

          if (key.match(/^REACT_APP_.*$/)) {
            reactAppEnv[`process.env.${key}`] = JSON.stringify(val);
          }
        }

        return reactAppEnv;
      })()),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "public", "index.html"),
        favicon: path.join(__dirname, "public", "favicon.ico"),
        hash: true, // For cache busting
        filename: path.join(__dirname, BUILD_FOLDER, "index.html"),
      }),
      new CopyPlugin({
        patterns: [
          {
            context: path.join(__dirname, "public"),
            from: "**/*",
            to: "",
            globOptions: {
              dot: false,
              gitignore: false,
              ignore: ["**/index.html", "**/favicon.ico"],
            },
          },
        ],
      }),
    ],
  };

  const setTsConfigFile = (configFile) => {
    const filteredRules = webpackConfig.module.rules
      .filter((rule) => rule && rule.loader === "ts-loader");

    if (filteredRules.length === 0 || !filteredRules[0]) {
      throw new Error(`Could not find 'ts-loader' rule to update 'configFile' to '${configFile}'.`);
    } else if (filteredRules.length !== 1) {
      throw new Error("More than 1 'ts-loader' rule found.");
    }

    const rule = filteredRules[0];

    if (!rule.options) {
      rule.options = {};
    }

    rule.options.configFile = configFile;
  };

  if (buildSettings.WEBPACK_MODE === "production") {
    webpackConfig.mode = "production";
    setTsConfigFile(path.join(__dirname, "configs", "ts", "tsconfig.prod.json"));
  } else {
    webpackConfig.mode = "development";
    setTsConfigFile(path.join(__dirname, "configs", "ts", "tsconfig.local.json"));
  }

  if (buildSettings.WEBPACK_SOURCE_MAPS === "true") {
    webpackConfig.devtool = false;
    webpackConfig.plugins.push(
      new webpack.SourceMapDevToolPlugin({
        filename: "[name].js.map",
      })
    );
  }

  if (buildSettings.WEBPACK_DEV_SERVER === "true") {
    webpackConfig.devServer = {
      port: 3000,
      open: false,
      hot: false,
    };
  }

  return webpackConfig;
};

module.exports = webpackConfigFn;
