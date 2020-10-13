const Request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const _ = require('lodash');
const ExcelJS = require('exceljs');
const Rewrite = require('./services/rewrite')
const countries = require('./constants/countries');
const selectors = require('./constants/selectors');
const notes = require('./constants/notes');
const Fred = require('fred-api');
// const FRED_API_KEY = require('../constants/api')
// const fred = new Fred(FRED_API_KEY);
process.env.FRED_KEY = 'f1325b1a0d00312e657806c2abb8eb87'
const apiKey = process.env.FRED_KEY;
const fred = new Fred('f1325b1a0d00312e657806c2abb8eb87');

class WebScraper {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
    }

    async init(urls) {
        const scrapeData = await this.getData(urls);
        this.createNotesWorksheet();
        this.prepareWorkbook(scrapeData);
        this.rewrite();
        this.generateWorkBook();

        //fred.getSeriesObservations({series_id: 'IRLTLT01EZM156N', frequency: 'm', observation_start: '2020-08-01', limit: 1}, (error, result) => result);
    }

    async prepareWorkbook(scrapeData) {
        for (let driver of scrapeData) {
            const worksheet = this.workbook.addWorksheet(`${driver.name}`);
            worksheet.columns = this.createWorksheetColumns();
            driver.data.forEach(element => {
                worksheet.addRow(element);
            });
        }
    }

    async getData(urls) {
        return await Promise.all(this.prepareRequests(urls));
    }
  
    prepareRequests(urls) {
        return urls.map(async driver => {
            const requestOptions = {
                url: driver.url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
                }
            };
            return await this.request(driver.name, requestOptions)
        })
    }

    prepareWorksheet(driverName, html) {
        let data = {};
        if (driverName !== 'T10') {
            const lastValues = this.extractData('lastValue', html);
            const dateRefs = this.extractData('dateRef', html);
            const countryLabels = this.extractData('country', html);
            data = {
                name: driverName,
                data: this.transformData(countryLabels, lastValues, dateRefs)
            };
        } else {
            const govBond = this.extractData('govBond', html);
            const yieldValue = this.extractData('yieldValue', html);
            const dateRefBond = this.extractData('dateRefBond', html);
            data = {
                name: driverName,
                data: this.transformData(govBond, yieldValue, dateRefBond)
            }
        }
        return data;
    }

    transformData(...data) {
        return _.chain(_.zip(...data))
            .filter(element => {
                return element.find(country => {
                    return _.map(countries, 'name').includes(country)
                });
            })
            .uniqWith(_.isEqual)
            .map(element => {
                const name = element[0];
                const countryCode = _.find(countries, { name }).code;
                return [...element, countryCode]
            })
            .value()
            .sort();
    }


    request(driverName, requestOptions) {
        return new Promise((resolve) => {
            return Request(requestOptions, (error, response, html) => {
                if (!error && response.statusCode == 200) {
                    resolve(this.prepareWorksheet(driverName, html));
                }
            });
        });
    }

    extractData(selector, html) {
        const $ = cheerio.load(html);
        const data = [];

        $(selectors[selector]).each((i, el) => {
            let value;
            if (selector === 'lastValue') {
                value = parseFloat(el.attribs['data-value']);
            } else {
                value = el.children[0].data.trim();
            }
            data.push(value);
        });
        return data;
    }

    rewrite() {
        /* Move US value from Business Confidence to PMI*/
        Rewrite.US_ISM(this.workbook);
    }

    createWorksheetColumns() {
        return [
            { header: 'Country', key: 'country', width: 20 },
            { header: 'Value', key: 'value' },
            { header: 'DateRef', key: 'dateRef' },
            { header: 'Country Code', key: 'countryCode' },
        ];
    }

    createNotesWorksheet() {
        this.workbook.addWorksheet('NOTES')
        const NOTES_WorkSheet = this.workbook.getWorksheet('NOTES');
        NOTES_WorkSheet.addRows(notes);
        const linksCol = NOTES_WorkSheet.getColumn(2);
        linksCol.font = {
            color: {argb: '0000FF'},
            underline: true
        }
        linksCol.width = 100;
        linksCol.eachCell((cell) => {
            const url = cell.value
            cell.value = {
                text: url,
                hyperlink: url,
            };
        });
    }

    async generateWorkBook() {
        const fileName = `${moment().format('MM.DD.YYYY')}_scrape.xlsx`;
        await this.workbook.xlsx.writeFile(fileName);
        process.stdout.write(`created ${fileName}`);
    }
}


module.exports = WebScraper;