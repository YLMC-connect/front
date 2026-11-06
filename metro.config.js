const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// Sentry 가 번들과 소스맵을 짝지을 수 있게 debug ID 를 넣는다.
module.exports = getSentryExpoConfig(__dirname);
