const request = require('request');
const xmlParser = require('xml2json');

const yapay = function(params) {
    this.token = params.token;
    this.mode = params.sandbox == true ? 'sandbox' : 'prod';

    switch (this.mode) {
        case 'prod': this.url = 'http://api.intermediador.yapay.com.br/v1'; break;
        case 'sandbox': this.url = 'https://api.intermediador.sandbox.yapay.com.br/v1'; break;
    }
}

yapay.prototype.simulateSplitting = function(value, cb) {
    const options = {
        url: this.url + '/transactions/simulate_splitting',
        json: {
            token_account: this.token,
            price: value
        }
    }    

    request.post(options, function(err, response, body) {
        if (err) {
            return cb(err, false);
        } else {
            const json = JSON.parse(xmlParser.toJson(body));

            if (json.transaction.message_response.message == 'error') {
                return cb(json.transaction.error_response, false);
            } else if (json.transaction.message_response.message == 'success') {
                return cb(false, json.transaction.data_response);
            }
        }
    })
}

module.exports = yapay;