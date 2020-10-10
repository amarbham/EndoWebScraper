const yargs = require("yargs");
const WebScraper = require('./webScraper/webScraper');
const CotNotesCopy = require('./cotNotesCopy/cotNotesCopy');
const endoDriverUrls = require('./constants/endoDriverUrls');
const webScraper = new WebScraper();
const cotNotesCopy = new CotNotesCopy();
const param = yargs.argv.param;

process.stdout.write(`Please wait... \n executing ${param} \n`);

if (param === 'webscraper') {
    webScraper.init(endoDriverUrls);
}

if (param === 'cotNotesCopy') {
    cotNotesCopy.init();
}