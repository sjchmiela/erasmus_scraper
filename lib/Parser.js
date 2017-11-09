'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _trim = require('lodash/trim');

var _trim2 = _interopRequireDefault(_trim);

var _filter = require('lodash/filter');

var _filter2 = _interopRequireDefault(_filter);

var _concat = require('lodash/concat');

var _concat2 = _interopRequireDefault(_concat);

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getParsedDocument(html) {
  return _cheerio2.default.load(html);
}

function checkIfRowIsAnAgreementRow(row) {
  var cells = (0, _cheerio2.default)(row).children('td');
  return cells.length === 8 && /\d+/.test(cells.eq(1).text());
}

function getAgreementsRows(doc) {
  return doc('.c-col tbody').find('tr').filter(function (_, element) {
    return checkIfRowIsAnAgreementRow(element);
  });
}

function parseAgreementRow(row) {
  var cells = (0, _cheerio2.default)(row).children('td').toArray().map(function (cell) {
    return (0, _cheerio2.default)(cell).text();
  });
  // Single cell format:
  // [ '' | country,
  // '465',
  // 'I TORINO02',
  // 'Politecnico di Torino',
  // '2014/2015',
  // '2020/2021',
  // 'prof.dr hab. Tomasz Stapiński',
  // 'WIEiT' ]
  return {
    country: null,
    code: cells[2],
    universityName: cells[3],
    startYear: cells[4],
    endYear: cells[5],
    coordinator: cells[6],
    department: cells[7]
  };
}

function getCountry(row) {
  return (0, _trim2.default)(row.children('td').eq(0).text());
}

function parseAgreementRows(rows) {
  var country = null;

  var parsedRows = [];

  for (var i = 0; i < rows.length; i += 1) {
    var element = rows.eq(i);

    // If the row has a non-empty country specified, update context.
    var currentCountry = getCountry(element);
    if (!(0, _isEmpty2.default)(currentCountry)) {
      country = currentCountry;
    }

    var rowData = parseAgreementRow(element);
    rowData.country = country;

    parsedRows = (0, _concat2.default)(parsedRows, [rowData]);
  }

  return parsedRows;
}

function pickStudentsAgreements(agreements, rejectingCountry) {
  return (0, _filter2.default)(agreements, function (_ref) {
    var country = _ref.country;
    return country !== rejectingCountry;
  });
}

function getStudentsAgreements(html, rejectingCountry) {
  var doc = getParsedDocument(html);
  var agreementsRows = getAgreementsRows(doc);
  var agreements = parseAgreementRows(agreementsRows);
  return pickStudentsAgreements(agreements, rejectingCountry);
}

exports.default = {
  getStudentsAgreements: getStudentsAgreements
};