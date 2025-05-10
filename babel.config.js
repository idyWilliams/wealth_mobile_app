module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          alias: {
            stream: "stream-browserify",
            http: "stream-http",
            https: "https-browserify",
            zlib: "browserify-zlib",
            path: "path-browserify",
            crypto: "crypto-browserify",
            os: "os-browserify/browser",
            util: "util",
            buffer: "buffer",
            events: "events",
            url: "url-polyfill",
          },
        },
      ],
    ],
    env: {
      production: {
        plugins: ["react-native-paper/babel"],
      },
    },
  };
};
