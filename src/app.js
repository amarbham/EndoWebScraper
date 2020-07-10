const yargs = require("yargs");
const WebScraper = require('./webScraper/webScraper');
const EndoUpdate = require('./endoUpdate/endoUpdate');
const endoDriverUrls = require('./constants/endoDriverUrls');
const webScraper = new WebScraper();
const endoUpdate = new EndoUpdate();
const param = yargs.argv.param;

process.stdout.write(`Please wait... \n executing ${param} \n`);

if (param === 'webscraper') {
    webScraper.init(endoDriverUrls);
}

if (param === 'endoUpdate') {
    endoUpdate.init();
}