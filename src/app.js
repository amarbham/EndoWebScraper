const WebScraper = require('./webscraper/webScraper');
const endoDriverUrls = require('./constants/endoDriverUrls');
const webScraper = new WebScraper();

webScraper.init(endoDriverUrls);