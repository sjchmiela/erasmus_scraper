import fs from "fs";
import request from "request";

import Parser from "./Parser";
import { agreementsUrl, rejectingCountry } from "../config";

if (process.argv.length <= 2) {
  console.log("Argument missing: path to the output file.");
  process.exit(1);
}

const fileToWriteTo = process.argv[2];

console.log(`Downloading URL ${agreementsUrl}...`);

request.get(agreementsUrl, (error, response, body) => {
  if (!error && response.statusCode === 200) {
    console.error(`Downloaded ${body.length} bytes, parsing...`);
    const studentsAgreements = Parser.getStudentsAgreements(body);
    console.log("Writing to file...");
    fs.writeFileSync(fileToWriteTo, JSON.stringify(studentsAgreements));
    console.log(`Results have been saved to \`${fileToWriteTo}\`.`);
  } else if (error) {
    console.log("Error occurred: ", error);
  } else {
    console.log(`Wrong status code: ${response.statusCode}, expected 200.`);
  }
});
