const yargs = require("yargs");
const WebScraper = require('./components/webscraper/webscraper');
const CotNotesCopy = require('./components/cotNotesCopy/cotNotesCopy');
const endoDriverUrls = require('./components/webscraper/constants/endoDriverUrls');
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