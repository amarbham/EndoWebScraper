const FredService = require('./fred')
const moment = require('moment');
const Fred = new FredService();

class RewriteService {
    constructor() { }

    US_ISM(workbook) {
        // Overwrite Business Confidence value into PMI value for ISM
        const BC_Worksheet = workbook.getWorksheet('BC');
        const PMI_Worksheet = workbook.getWorksheet('PMI');
        this.overwriteValuesInWorksheetByCountry('United States', BC_Worksheet, PMI_Worksheet);
    }

    async EUR_T10(workbook) {
        // write EUR 10Y value into T10%
        const Gov10Y_Worksheet = workbook.getWorksheet('T10');
        return Fred.getById('IRLTLT01EZM156N').then(({observations}) => {
            const date = moment(observations[0].date).format('MMM/DD');
            const value = parseFloat(observations[0].value).toFixed(2);
            Gov10Y_Worksheet.addRow(['Euro Area', value, date, 'EUR']);
        });
    }

    async AUD_IR(workbook) {
        // write AUD IR value into IR%
        const IR_Worksheet = workbook.getWorksheet('IR%');
        return Fred.getById('IRSTCI01AUM156N').then(({observations}) => {
            const date = moment(observations[0].date).format('MMM/YY');
            const value = parseFloat(observations[0].value).toFixed(2);
            IR_Worksheet.addRow(['Australia', value, date, 'AUD']);
        });
    }

    async US_PPI(workbook) {
        const PPI_Worksheet = workbook.getWorksheet('PPI');
        return Fred.getById('WPSFD49207').then(({observations}) => {
            const value = parseFloat(observations[0].value).toFixed(2);
            this.writeValueIntoCountry(value, 'United States', PPI_Worksheet)
        });
    }

    async US_CPPI(workbook) {
        const CPPI_Worksheet = workbook.getWorksheet('CPPI');
        return Fred.getById('WPSFD4131').then(({observations}) => {
            const value = parseFloat(observations[0].value).toFixed(2);
            this.writeValueIntoCountry(value, 'United States', CPPI_Worksheet)
        });
    }

    overwriteValuesInWorksheetByCountry(country, fromWorksheet, toWorksheet) {
        const rowIndexFrom = this.getIndexOfCountryInWorksheet(country,  fromWorksheet)
        const rowIndexTo = this.getIndexOfCountryInWorksheet(country,  toWorksheet);
        toWorksheet.getRow(rowIndexTo).values = fromWorksheet.getRow(rowIndexFrom).values;
    }

    writeValueIntoCountry(newValue, country, worksheet) {
        // Write a new value into a cell by a given country
        const indexOfCountry = this.getIndexOfCountryInWorksheet(country, worksheet);
        // Value is the 2nd cell
        worksheet.getRow(indexOfCountry).getCell(2).value = newValue;
    }

    getIndexOfCountryInWorksheet(country, worksheet){
        return worksheet.getColumn(1).values.indexOf(country);
    }
}

module.exports = RewriteService