import "react-native-url-polyfill/auto";
import "node-libs-react-native/globals";
import "react-native-polyfill-globals";

// Buffer polyfill
import { Buffer } from "@craftzdog/react-native-buffer";
global.Buffer = Buffer;

// Crypto polyfill
import "react-native-crypto";

// Stream polyfills
import "stream-browserify";
import "stream-http";
import "https-browserify";
import "browserify-zlib";

// WebSocket polyfills
import { WebSocket } from "react-native";
global.WebSocket = WebSocket;

// Additional polyfills for WebSocket
if (typeof global.WebSocket !== "function") {
  global.WebSocket = WebSocket;
}

// Polyfill for net module
if (typeof global.net === "undefined") {
  global.net = {
    Socket: WebSocket,
    createConnection: (options) => {
      return new WebSocket(options.host);
    },
  };
}

// Polyfill for tls module
if (typeof global.tls === "undefined") {
  global.tls = {
    connect: (options) => {
      return new WebSocket(options.host);
    },
  };
}

// Polyfill for crypto module
if (typeof global.crypto === "undefined") {
  global.crypto = require("react-native-crypto");
}

// Polyfill for stream module
if (typeof global.stream === "undefined") {
  global.stream = require("stream-browserify");
}

// Polyfill for http module
if (typeof global.http === "undefined") {
  global.http = require("stream-http");
}

// Polyfill for https module
if (typeof global.https === "undefined") {
  global.https = require("https-browserify");
}

// Polyfill for zlib module
if (typeof global.zlib === "undefined") {
  global.zlib = require("browserify-zlib");
}
