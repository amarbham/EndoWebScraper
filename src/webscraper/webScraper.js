const Request = require('request');
const cheerio = require('cheerio');
const zip = require('lodash/zip');
const ExcelJS = require('exceljs');
const countries = require('../constants/countries');

class WebScraper {
    constructor() {
    }

    init(urls) {
        this.generateWorkBook(urls);
    }

    async generateWorkBook(urls) {
        const workbook = new ExcelJS.Workbook();
        const data =  await Promise.all(this.prepareRequests(urls))

        for (let driver of data) {
            const worksheet = workbook.addWorksheet(`${driver.name}`);
            worksheet.columns = this.createWorksheetColumns();
            driver.data.forEach(element => {
                worksheet.addRow(element);
            });
        }
        const fileName = 'download.xlsx';
        await workbook.xlsx.writeFile(fileName);
        process.stdout.write(`created ${fileName}`);
    }

    request(driverName, requestOptions) {
        return new Promise((resolve) => {
            return Request(requestOptions, (error, response, html) => {
                if (!error && response.statusCode == 200) {
                    const lastValues = this.extractData('lastValue', html);
                    const dateRefs = this.extractData('dateRef', html);
                    const countryLabels = this.extractData('country', html);
                    const data = {
                        name: driverName,
                        data: this.prepareData(countryLabels, lastValues, dateRefs)
                    };
                    resolve(data);
                }
            });
        });
    }

    extractData(selector, html) {
        const $ = cheerio.load(html);
        const selectors = {
            country: 'table.table > tbody > tr td:nth-child(1) > a',
            lastValue: 'table.table > tbody > tr td:nth-child(2)',
            dateRef: 'table.table > tbody > tr td:nth-child(4) > span'
        };
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

    prepareData(...data) {
        return zip(...data).filter(element => {
            return element.find(country => {
                return countries.includes(country);
            });
        });
    }

    createWorksheetColumns() {
        return [
            { header: 'Country', key: 'country', width: 20 },
            { header: 'Value', key: 'value' },
            { header: 'DateRef', key: 'dateRef' },
        ];
    }
}


module.exports = WebScraper;