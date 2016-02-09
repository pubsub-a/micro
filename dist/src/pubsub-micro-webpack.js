/*
  custom JS file as TS/Webpack don't bundle to global variable correctly
  See: https://github.com/Microsoft/TypeScript/issues/2719 for problem description
*/

var pubsub = require('./pubsub-micro');
module.exports = pubsub.default;

