const US_ISM = (workbook) => {
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

module.exports = {US_ISM}