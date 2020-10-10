const selectors = {
    country: 'table.table > tbody > tr td:nth-child(1) > a',
    lastValue: 'table.table > tbody > tr td:nth-child(2)',
    dateRef: 'table.table > tbody > tr td:nth-child(4) > span',
    govBond: 'table > tbody > tr td:nth-child(2) > a > b',
    yieldValue: 'table > tbody > tr td:nth-child(3)',
    dateRefBond: 'table > tbody > tr td#date'
};

module.exports = selectors;