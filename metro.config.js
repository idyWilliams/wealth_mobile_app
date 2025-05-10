const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add extraNodeModules to handle essential Node.js core modules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve("stream-browserify"),
  http: require.resolve("stream-http"),
  https: require.resolve("https-browserify"),
  zlib: require.resolve("browserify-zlib"),
  path: require.resolve("path-browserify"),
  crypto: require.resolve("crypto-browserify"),
  os: require.resolve("os-browserify/browser"),
  util: require.resolve("util/"),
  buffer: require.resolve("buffer/"),
  events: require.resolve("events/"),
  url: require.resolve("url-polyfill"),
};

// Add buffer to the list of polyfills
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

// Configure Hermes
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("metro-react-native-babel-transformer"),
  assetPlugins: ["expo-asset/tools/hashAssetFiles"],
};

// Add WebSocket to the list of modules to be transformed
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
