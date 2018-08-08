const request = require('request');
const xmlParser = require('xml2json');

const yapay = function(params) {
    this.token = params.token;
    this.mode = params.sandbox == true ? 'sandbox' : 'prod';

    switch (this.mode) {
        case 'prod': this.url = 'http://api.intermediador.yapay.com.br'; break;
        case 'sandbox': this.url = 'https://api.intermediador.sandbox.yapay.com.br'; break;        
    }

    this.transaction_data = {
        transaction_product: [],
        transaction: {},
        payment: {},
        customer: {
            addresses: [],
            contacts: []
        }
    }
}

yapay.prototype.simulateSplitting = function(value, cb) {
    const options = {
        url: this.url + '/v1/transactions/simulate_splitting',
        json: {
            token_account: this.token,
            price: value.toString()
        }
    }

    request.post(options, (err, response, body) => {
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

yapay.prototype.getPerson = function(params, cb) {
    let json = {};
    if (params.email) {
        json.email = params.email
    }
    if (params.cpf) {
        json.cpf = params.cpf
    }

    const options = {
        url: this.url + '/v1/people/get_person_by_cpf_and_email',
        json: json
    }

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            const json = JSON.parse(xmlParser.toJson(body));

            if (json.people.message_response.message == 'error') {
                return cb(json.people.error_response, false);
            } else if (json.people.message_response.message == 'success') {
                return cb(false, json.people.data_response);
            }
        }
    })
}

module.exports = yapay;