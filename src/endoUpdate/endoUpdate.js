// Loop each country and Read workbook file.
// Loop each driver in country workbook
// If driver uses trading economics source then...
// Read endoDriverDataDownload.xlsx and go to matching driver name
// Find country in matching driver name in endoDriverDataDownload.xlsx and copy it's value
// Insert value in country workbook file.

const countries = require('../constants/countries');
const endoXlFiles = require('../constants/endoXlFileNames');
const ExcelJS = require('exceljs');

class EndoUpdate {
    constructor(){}

    init() {
        
    }
}

module.exports = EndoUpdate;