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
        this.createNotesWorksheet()
        this.generateWorkBook(urls);
    }

    async generateWorkBook(urls) {
        const data = await Promise.all(this.prepareRequests(urls))

        for (let driver of data) {
            const worksheet = this.workbook.addWorksheet(`${driver.name}`);
            worksheet.columns = this.createWorksheetColumns();
            driver.data.forEach(element => {
                worksheet.addRow(element);
            });
        }

        /* Move US value from Business Confidence to PMI*/
        this.rewrite_ISM();

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
            ['AUD BP', 'https://www.abs.gov.au/AUSSTATS/abs@.nsf/second+level+view?ReadForm&prodno=8731.0&viewtitle=Building%20Approvals,%20Australia~Aug%202019~Previous~01/10/2019&&tabname=Past%20Future%20Issues&prodno=8731.0&issue=Aug%202019&num=&view=&'],
            ['AUD M2', 'https://www.ceicdata.com/en/indicator/australia/money-supply-m2'],
            ['AUD IR', 'https://fred.stlouisfed.org/series/IRSTCI01AUM156N'],
            ['UK BP', 'https://www.gov.uk/government/statistical-data-sets/live-tables-on-planning-application-statistics'],
            ['US NMI', 'https://tradingeconomics.com/united-states/non-manufacturing-pmi'],
            ['US PPI', 'https://fred.stlouisfed.org/series/WPSFD49207'],
            ['US PPI CORE', 'https://fred.stlouisfed.org/series/WPSFD4131'],
            ['NZ M2', 'https://www.ceicdata.com/en/indicator/new-zealand/money-supply-m2']
        ];
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
}


module.exports = WebScraper;