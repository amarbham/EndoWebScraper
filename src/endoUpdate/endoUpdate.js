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
const isUndefined = require('lodash/isUndefined');
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
            const downloadSheetData = this.prepareSheetValueDataForCopy(worksheet.getSheetValues(), sheet.name);

            downloadSheetData.forEach(item => {
                this.copyValues(item, sheet.name)
            });
        });
    }

    copyValues(item, targetSheet) {
        console.log(item.country);
        console.log(item.value);
        console.log(item.dateRef);
        console.log(targetSheet);
    }

    prepareSheetValueDataForCopy(sheetValues, sheetName) {
        return sheetValues
            .slice(2)
            .reduce((acc, row) => {
                let country = row[1];
                let value = row[2];
                let dateRef = moment(row[3], 'MMM/YY');
                let endoDrivers = endoDriversUsingTradingEconomics[country];

                if (!isUndefined(endoDrivers) && endoDrivers.drivers.includes(sheetName)) {
                    return acc.concat({country, value, dateRef});
                } else {
                    return acc;
                }
            }, [])
    }
}

module.exports = EndoUpdate;