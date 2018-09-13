const request = require('request');
const xmlParser = require('xml2json');

const yapay = function(params) {
    this.token = params.token;
    this.reseller_token = params.reseller;
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

yapay.prototype.addProduct = function(item) {
    this.transaction_data.transaction_product.push({
        description: item.description,
        quantity: item.quantity,
        price_unit: item.price
    })
}

yapay.prototype.setCustomer = function(customer) {
    this.transaction_data.customer.email = customer.email;
    if (customer.name) {
        this.transaction_data.customer.name = customer.name;
    }

    if (customer.birth_date) {
        this.transaction_data.customer.birth_date = customer.birth_date;
    }

    if (customer.cpf) {
        this.transaction_data.customer.cpf = customer.cpf;
    }

    if (customer.phone_number) {
        this.transaction_data.customer.contacts.push({
            type_contact: 'M',
            number_contact: customer.phone_number
        })
    }
}

yapay.prototype.setAddress = function(address) {
    this.transaction_data.customer.addresses.push({
        type_address: address.type_address,
        postal_code: address.postal_code,
        street: address.street,
        number: address.number,
        city: address.city,
        state: address.state,
        neighborhood: address.neighborhood
    })
}

yapay.prototype.setShipping = function(shipping) {
    this.transaction_data.transaction.shipping_price = shipping.price;
    this.transaction_data.transaction.shipping_type = shipping.type;
}

yapay.prototype.payment = function(params, cb) {
    let url;
    switch (this.mode) {
        case 'prod': url = 'https://api.intermediador.sandbox.yapay.com.br/api/v3/transactions/payment'; break;
        case 'sandbox': url = 'https://api.intermediador.sandbox.yapay.com.br/api/v3/transactions/payment'; break;
    }

    this.transaction_data.token_account = this.token;
    if (this.reseller_token) {
        this.transaction_data.reseller_token = this.reseller_token;
    }

    this.transaction_data.payment = {
        payment_method_id: getPaymentMethodId(params.card_number),
        card_number: params.card_number,
        card_name: params.card_name,
        card_expdate_month: params.card_expire_month,
        card_expdate_year: params.card_expire_year,
        card_cvv: params.card_cvv,
        split: params.split || 1
    }

    const options = {
        url: this.url + '/v3/transactions/payment',
        json: this.transaction_data
    }    

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            if (body.message_response.message == 'error') {
                return cb(body.error_response, false);
            } else if (body.message_response.message == 'success') {
                return cb(false, body.data_response);
            }
        }
    })
}

yapay.prototype.cancelTransaction = function(transaction_id, cb) {
    const options = {
        url: this.url + '/v3/transactions/cancel',
        json: {
            access_token: this.token,
            transaction_id: Number(transaction_id),
            reason_cancellation_id: '6'
        }
    }    

    request.patch(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            if (body.message_response.message == 'error') {
                return cb(body.error_response, false);
            } else if (body.message_response.message == 'success') {
                return cb(false, body.data_response);
            }
        }
    })
}

function getPaymentMethodId(card_number) {
    //amex
    if (card_number.substring(0, 2) == '34' || card_number.substring(0, 2) == '37') {
        return '5';
    //visa
    } else if (card_number.substring(0, 1) == '4') {
        return '3';
    //mastercard
    } else if (card_number.substring(0, 1) == '5') {
        return '4';
    //diners
    } else if (card_number.substring(0, 3) == '301' || card_number.substring(0, 3) == '305' || card_number.substring(0, 2) == '36' || card_number.substring(0, 2) == '38') {
        return '2';
    //hipercard
    } else if (card_number.substring(0, 2) == '38' || card_number.substring(0, 2) == '60') {
        return '20';
    }
}

module.exports = yapay;