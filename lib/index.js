'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _Parser = require('./Parser');

var _Parser2 = _interopRequireDefault(_Parser);

var _config = require('../config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (process.argv.length <= 2) {
  console.log('Argument missing: path to the output file.');
  process.exit(1);
}

var fileToWriteTo = process.argv[2];

console.log('Downloading URL ' + _config.agreementsUrl + '...');

_request2.default.get(_config.agreementsUrl, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    console.error('Downloaded ' + body.length + ' bytes, parsing...');
    var studentsAgreements = _Parser2.default.getStudentsAgreements(body, _config.rejectingCountry);
    console.log('Writing to file...');
    _fs2.default.writeFileSync(fileToWriteTo, JSON.stringify(studentsAgreements));
    console.log('Results have been saved to `' + fileToWriteTo + '`.');
  } else if (error) {
    console.log('Error occurred: ', error);
  } else {
    console.log('Wrong status code: ' + response.statusCode + ', expected 200.');
  }
});