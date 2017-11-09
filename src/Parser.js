import cheerio from 'cheerio';
import trim from 'lodash/trim';
import filter from 'lodash/filter';
import concat from 'lodash/concat';
import isEmpty from 'lodash/isEmpty';

function getParsedDocument(html) {
  return cheerio.load(html);
}

function checkIfRowIsAnAgreementRow(row) {
  const cells = cheerio(row).children('td');
  return cells.length === 8 && /\d+/.test(cells.eq(1).text());
}

function getAgreementsRows(doc) {
  return doc('.c-col tbody')
    .find('tr')
    .filter((_, element) => checkIfRowIsAnAgreementRow(element));
}

function parseAgreementRow(row) {
  const cells = cheerio(row).children('td').toArray().map(cell => cheerio(cell).text());
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
    department: cells[7],
  };
}

function getCountry(row) {
  return trim(row.children('td').eq(0).text());
}

function parseAgreementRows(rows) {
  let country = null;

  let parsedRows = [];

  for (let i = 0; i < rows.length; i += 1) {
    const element = rows.eq(i);

    // If the row has a non-empty country specified, update context.
    const currentCountry = getCountry(element);
    if (!isEmpty(currentCountry)) {
      country = currentCountry;
    }

    const rowData = parseAgreementRow(element);
    rowData.country = country;

    parsedRows = concat(parsedRows, [rowData]);
  }

  return parsedRows;
}

function pickStudentsAgreements(agreements, rejectingCountry) {
  return filter(agreements, ({ country }) => country !== rejectingCountry);
}

function getStudentsAgreements(html, rejectingCountry) {
  const doc = getParsedDocument(html);
  const agreementsRows = getAgreementsRows(doc);
  const agreements = parseAgreementRows(agreementsRows);
  return pickStudentsAgreements(agreements, rejectingCountry);
}

export default {
  getStudentsAgreements,
};
