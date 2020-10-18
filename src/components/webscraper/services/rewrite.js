const FredService = require('./fred')
const Fred = new FredService();

class RewriteService {
    constructor() { }

    US_ISM(workbook) {
        // Overwrite Business Confidence value into PMI value for ISM
        const businessConfidence_WorkSheet = workbook.getWorksheet('BC');
        const PMI_WorkSheet = workbook.getWorksheet('PMI');
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
            if (country === 'United States') {
                US_BUSINESS_CONFIDENCE_ROW_NUMBER = rowNumber
            }
        })
        PMI_WorkSheet.getRow(US_ISM_ROW_NUMBER).values = businessConfidence_WorkSheet.getRow(US_BUSINESS_CONFIDENCE_ROW_NUMBER).values;
    }

    EUR_T10(workbook) {
        // write EUR 10Y value into T10%
        Fred.getById('IRLTLT01EZM156N').then(data => {
        });
    }

    AUD_IR(workbook) {
        // write AUD IR value into IR%
        Fred.getById('IRSTCI01AUM156N').then(data => {
        });
    }

    US_PPI(workbook) {
        Fred.getById('WPSFD49207').then(data => {
        });
    }

    US_CPPI(workbook) {
        Fred.getById('WPSFD4131').then(data => {
        });
    }
}

module.exports = RewriteService