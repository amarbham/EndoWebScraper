const Fred = require('fred-api');
const fred = new Fred('f1325b1a0d00312e657806c2abb8eb87');

class FredService {
    constructor(){}

    async getById(id) {
        // Returns the latest months data
        const payload = {
            series_id: id,
            frequency: 'm',
            sort_order: 'desc',
            limit: 1
        }
        return await new Promise(resolve => fred.getSeriesObservations(payload, (error, result) => {
            if (error) console.error(error)
            return resolve(result)
        }));
    }
}



module.exports = FredService