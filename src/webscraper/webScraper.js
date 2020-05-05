const Request = require('request');
const cheerio = require('cheerio');
const zip = require('lodash/zip');
const ExcelJS = require('exceljs');
const countries = require('../constants/countries');

class WebScraper {
    constructor() { }

    async init(urls) {
        const data = await this.prepareRequests(urls);

        for (let driver of data) {
            this.generateWorkbook(driver);
        }
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
                    }
                    resolve(data)
                }
            });
        })
    }

    // request(options) {
    //     Request(options, (error, response, html) => {
    //         if (!error && response.statusCode == 200) {
    //             const lastValues = this.extractData('lastValue', html);
    //             const dateRefs = this.extractData('dateRef', html);
    //             const countryLabels = this.extractData('country', html);
    //             const data = this.prepareData(countryLabels, lastValues, dateRefs)
    //             console.log(data)
    //             // this.generateWorkbook(data);
    //         }
    //     });
    // }

    extractData(selector, html) {
        const $ = cheerio.load(html);
        const selectors = {
            country: 'table.table > tbody > tr td:nth-child(1) > a',
            lastValue: 'table.table > tbody > tr td:nth-child(2)',
            dateRef: 'table.table > tbody > tr td:nth-child(4) > span'
        }
        const data = [];

        $(selectors[selector]).each((i, el) => {
            let value;
            if (selector === 'lastValue') {
                value = parseFloat(el.attribs['data-value']);
            } else {
                value = el.children[0].data.trim()
            }
            data.push(value)
        });
        return data;
    }

    prepareRequests(endoDriversUrls) {
        return Promise.all(endoDriversUrls.map(driver => {
            const requestOptions = {
                url: driver.url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
                }
            }
            return this.request(driver.name, requestOptions)
        }))
    }

    prepareData(...data) {
        return zip(...data).filter(element => {
            return element.find(country => {
                return countries.includes(country)
            })
        })
    }

    async generateWorkbook(driver) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${driver.name}`);

        worksheet.columns = [
            { header: 'Country', key: 'country', width: 20 },
            { header: 'Value', key: 'value' },
            { header: 'DateRef', key: 'dateRef' },
        ];

        driver.data.forEach(element => {
            worksheet.addRow(element);
        });

        await workbook.xlsx.writeFile(`${driver.name}.xlsx`);
        console.log('Completed');
    };
}


module.exports = WebScraper