const path = require('path');
const ExcelJS = require('exceljs');
const Big = require('big.js');
const cotOpenInterestdWorkBookFile = path.join(__dirname, '../../../files/COT/COT & Open Interest Report.xlsx');
const cotNotesdWorkBookFile = path.join(__dirname, '../../../files/COT/COT Notes.xlsx');

class CotNotesCopy {
    constructor() {
        this.cotOpenInterestWorkbook = new ExcelJS.Workbook()
        this.cotNotesWorkbook = new ExcelJS.Workbook()
    }

    async init() {
        await this.cotOpenInterestWorkbook.xlsx.readFile(cotOpenInterestdWorkBookFile);
        await this.cotNotesWorkbook.xlsx.readFile(cotNotesdWorkBookFile);
        const cellRefs = {
            date: 'A3',
            flip: 'H3',
            leveragedFunds: 'J3'
        }

        this.cotOpenInterestWorkbook.eachSheet((worksheet, sheetId) => {
            if (worksheet.name === 'BRL' || worksheet.name === 'EURJPY') return;
            const date = worksheet.getCell('A3').value, 
                  flip = worksheet.getCell('H3').result, 
                  leveragedFunds = new Big(worksheet.getCell('J3').value).times(100).toFixed(2) + '%';
            const targetWorksheet = this.cotNotesWorkbook.getWorksheet(worksheet.name);

            targetWorksheet.insertRow(2, [date, flip, leveragedFunds]);
        });
        await this.cotNotesWorkbook.xlsx.writeFile(cotNotesdWorkBookFile);
    }
}

module.exports = CotNotesCopy;