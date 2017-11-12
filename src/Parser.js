import cheerio from "cheerio";
import trim from "lodash/trim";
import filter from "lodash/filter";
import concat from "lodash/concat";
import isEmpty from "lodash/isEmpty";
import uniq from "lodash/uniq";

const countryToIso = {
  AUSTRIA: "AT",
  BELGIA: "BE",
  BUŁGARIA: "BG",
  CHORWACJA: "HR",
  CYPR: "CY",
  CZECHY: "CZ",
  DANIA: "DK",
  ESTONIA: "EE",
  FINLANDIA: "FI",
  FRANCJA: "FR",
  GRECJA: "GR",
  HISZPANIA: "ES",
  HOLANDIA: "NL",
  ISLANDIA: "IS",
  LITWA: "LT",
  MACEDONIA: "MK",
  NIEMCY: "DE",
  NORWEGIA: "NO",
  PORTUGALIA: "PT",
  RUMUNIA: "RO",
  SLOWACJA: "SK",
  SŁOWENIA: "SI",
  SZWECJA: "SE",
  TURCJA: "TR",
  WĘGRY: "HU",
  WŁOCHY: "IT",
  "WIELKA  BRYTANIA": "GB",
};

function getParsedDocument(html) {
  return cheerio.load(html);
}

function checkIfRowIsAnAgreementRow(row) {
  const cells = cheerio(row).children("td");
  return cells.length === 8 && /\d+/.test(cells.eq(1).text());
}

function getAgreementsRows(doc) {
  return doc(".c-col tbody")
    .find("tr")
    .filter((_, element) => checkIfRowIsAnAgreementRow(element));
}

function parseAgreementRow(row) {
  const cells = cheerio(row)
    .children("td")
    .toArray()
    .map(cell => cheerio(cell).text());
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
  return trim(
    row
      .children("td")
      .eq(0)
      .text()
  );
}

function parseAgreementRows(rows) {
  let country = null;
  const unknownCountries = [];

  let parsedRows = [];

  for (let i = 0; i < rows.length; i += 1) {
    const element = rows.eq(i);

    const currentCountry = getCountry(element);

    if (!isEmpty(currentCountry)) {
      country = countryToIso[currentCountry];

      if (isEmpty(country)) {
        unknownCountries.push(currentCountry);
      }
    }

    const rowData = parseAgreementRow(element);
    rowData.country = country;

    parsedRows = concat(parsedRows, [rowData]);
  }

  if (!isEmpty(unknownCountries)) {
    console.warn(`Unknown countries: ${uniq(unknownCountries)}.`);
  }

  return parsedRows;
}

function pickStudentsAgreements(agreements) {
  return filter(agreements, 'country');
}

function getStudentsAgreements(html) {
  const doc = getParsedDocument(html);
  const agreementsRows = getAgreementsRows(doc);
  const agreements = parseAgreementRows(agreementsRows);
  return pickStudentsAgreements(agreements);
}

export default {
  getStudentsAgreements
};
