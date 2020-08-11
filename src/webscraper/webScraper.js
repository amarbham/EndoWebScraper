const Request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const zip = require('lodash/zip');
const map = require('lodash/map');
const find = require('lodash/find');
const ExcelJS = require('exceljs');
const countries = require('../constants/countries');

class WebScraper {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
    }

    init(urls) {
        this.generateWorkBook(urls);
    }

    async generateWorkBook(urls) {
        const data =  await Promise.all(this.prepareRequests(urls))

        for (let driver of data) {
            const worksheet = this.workbook.addWorksheet(`${driver.name}`);
            worksheet.columns = this.createWorksheetColumns();
            driver.data.forEach(element => {
                worksheet.addRow(element);
            });
        }

        /* Move US value from Business Confidence to PMI*/
        this.rewrite_ISM();
        this.createNotesWorksheet()

        const fileName = `${moment().format('MM.DD.YYYY')}_scrape.xlsx`;
        await this.workbook.xlsx.writeFile(fileName);
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
        return zip(...data)
            .filter(element => {
                return element.find(country => {
                    return map(countries, 'name').includes(country);
                });
            })
            .map(element => {
                const name = element[0];
                const countryCode = find(countries, { name }).code;
                return [...element, countryCode]
            })
            .sort();
    }

    createWorksheetColumns() {
        return [
            { header: 'Country', key: 'country', width: 20 },
            { header: 'Value', key: 'value' },
            { header: 'DateRef', key: 'dateRef' },
            { header: 'Country Code', key: 'countryCode' },
        ];
    }

    rewrite_ISM() {
        // Overwrite Business Confidence value into PMI value for ISM
        const businessConfidence_WorkSheet = this.workbook.getWorksheet('BC');
        const PMI_WorkSheet = this.workbook.getWorksheet('PMI');
        let US_ISM_ROW_NUMBER;
        let US_BUSINESS_CONFIDENCE_ROW_NUMBER;

        PMI_WorkSheet.eachRow((row, rowNumber) => {
            const country = row.getCell('country').value;
            if (country === 'United States') {
                US_ISM_ROW_NUMBER = rowNumber            
            }
        })

        businessConfidence_WorkSheet.eachRow((row, rowNumber) => {
            const country = row.getCell('country').value;
            let US_ISM_ROW_NUMBER
            if (country === 'United States') {
                US_BUSINESS_CONFIDENCE_ROW_NUMBER = rowNumber            
            }
        })
    
        PMI_WorkSheet.getRow(US_ISM_ROW_NUMBER).values = businessConfidence_WorkSheet.getRow(US_BUSINESS_CONFIDENCE_ROW_NUMBER).values;
    }

    createNotesWorksheet() {
        this.workbook.addWorksheet('NOTES')
        const NOTES_WorkSheet = this.workbook.getWorksheet('NOTES');
        const notes = [
            'Checklist for manual changes required',
            'AUD BP',
            'AUD M2',
            'AUD IR',
            'EUR T10',
            'UK BP',
            'US NMI',
            'US PPI',
            'US PPI CORE',
            'NZ M2'
        ];

        NOTES_WorkSheet.getColumn(1).values = notes
    }
}


module.exports = WebScraper;