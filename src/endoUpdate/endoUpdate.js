// Loop each country and Read workbook file.
// Loop each driver in country workbook
// If driver uses trading economics source then...
// Read endoDriverDataDownload.xlsx and go to matching driver name
// Find country in matching driver name in endoDriverDataDownload.xlsx and copy it's value
// Insert value in country workbook file.

// const countries = require('../constants/countries'); uncomment when adding rest of countries
const moment = require('moment');
const countries = ['SWITZERLAND'];
const filenames = require('../constants/filenames');
const endoDriversUsingTradingEconomics = require('../constants/endoDriversUsingTradingEconomics');
const ExcelJS = require('exceljs');
const path = require('path');
const SWISS_endoSheet = path.join(__dirname, '../../endoSheets/SWZ_Endogenous_driver_analysis.xlsx');
const endoDownloadWorkBookFile = path.join(__dirname, '../../download.xlsx');


class EndoUpdate {
    constructor() {
        this.workbook = new ExcelJS.Workbook()
    }

    async init() {
        await this.workbook.xlsx.readFile(endoDownloadWorkBookFile);

        this.workbook.worksheets.forEach(sheet => {
            const worksheet = this.workbook.getWorksheet(sheet.name);

            const data = worksheet.getSheetValues()
                .slice(2)
                .map((item) => item.slice(1));

                data.forEach((row) => {
                    const dateStr = row[2]
                    const date = moment(dateStr, 'MMM/YY');
                })
        });
        // countries.forEach(country => this.getExcelWorkbookForCountry(country));
    }

    getExcelWorkbookForCountry(country) {
        console.log(country)
    }

    async copyValue() {
        const workbook = new ExcelJS.Workbook();
        console.log(filenames.FILE_NAME_SWITZERLAND)
        // await workbook.xlsx.readFile(SWISS_endoSheet);
        // var worksheet = workbook.getWorksheet('PMI');
        // worksheet.getCell('B2').value = 11;
        // workbook.xlsx.writeFile(SWISS_endoSheet);
    }
}

module.exports = EndoUpdate;