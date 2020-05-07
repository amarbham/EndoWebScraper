const assert = require('chai').assert;
const WebScraper = require('./webScraper');
const htmlMock = require('./htmlMock');
const countries = require('./countries');

describe('WebScraper', () => {
    const webScraper = new WebScraper();
    webScraper.init();

    describe('extractData()', () => {

        it('should extract "last value" numbers by "last values" selector', () => {
            const lastValues = webScraper.extractData('lastValue', htmlMock);
            assert.equal(lastValues.every(element => !!element), true);
        });

        it('should extract "country" labels from the "countries" selector', () => {
            const countryLabels = webScraper.extractData('country', htmlMock);
            assert.equal(countries.every(el => countryLabels.includes(el)), true);
        });

        it('should extract date reference from the "dateRefs" selector', () => {
            const dateRefs = webScraper.extractData('dateRef', htmlMock);
            const dateRegexFormat = /^[a-zA-Z]{3}\/\d{2}$/;
            assert.equal(dateRefs.every(el => el.match(dateRegexFormat)), true);
        });
    });
});