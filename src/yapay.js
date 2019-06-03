const request = require('request');
const xmlParser = require('xml2json');

const yapay = function(params) {
    this.token = params.token;
    this.resellerToken = params.reseller;
    this.accessToken = '';
    this.mode = params.sandbox === true ? 'sandbox' : 'prod';

    switch (this.mode) {
        case 'prod': this.url = 'https://api.intermediador.yapay.com.br'; break;
        case 'sandbox': this.url = 'https://api.intermediador.sandbox.yapay.com.br'; break;        
    }

    this.transactionData = {
        transactionProduct: [],
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

            if (json.transaction.message_response.message === 'error') {
                return cb(json.transaction.error_response, false);
            } else if (json.transaction.message_response.message === 'success') {
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
        json.cpf = params.cpf;
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

            if (json.people.message_response.message === 'error') {
                return cb(json.people.error_response, false);
            } else if (json.people.message_response.message === 'success') {
                return cb(false, json.people.data_response);
            }
        }
    })
}

yapay.prototype.getPeopleByReseller = function(email, cb) {
    const options = {
        url: this.url + '/v1/people/get_by_reseller',
        json: {
            email: email,
            reseller_token: this.resellerToken
        }
    }

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            const json = JSON.parse(xmlParser.toJson(body));

            if (json.people.message_response.message === 'error') {
                return cb(json.people.error_response, false);
            } else if (json.people.message_response.message === 'success') {
                return cb(false, json.people.data_response);
            }
        }
    })
}

yapay.prototype.createBankAccount = function(params, accessToken, cb) {
    const options = {
        url: this.url + '/v1/bank_accounts/create',
        json: {
            access_token: accessToken,
            bank_code: params.bank_code,
            agency: params.agency,
            account: params.account,
            type_account: 'S'
        }
    }

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            const json = JSON.parse(xmlParser.toJson(body));

            if (json.bank_account.message_response.message === 'error') {
                return cb(json.bank_account.error_response, false);
            } else if (json.bank_account.message_response.message === 'success') {
                return cb(false, json.bank_account.data_response);
            }
        }
    })
}

yapay.prototype.searchBankAccount = function(accessToken, cb) {
    const options = {
        url: this.url + '/v1/bank_accounts/search',
        json: {
            access_token: accessToken
        }
    }

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            const json = JSON.parse(xmlParser.toJson(body));

            if (json.bank_account.message_response.message === 'error') {
                return cb(json.bank_account.error_response, false);
            } else if (json.bank_account.message_response.message === 'success') {
                return cb(false, json.bank_account.data_response);
            }
        }
    })
}

yapay.prototype.getBalance = function(accessToken, cb) {
    const options = {
        url: this.url + '/v3/balance',
        headers: {
            Authorization: `Token token=${accessToken}, type=access_token`
        }
    }

    request.get(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            const json = JSON.parse(body);
            return cb(false, json);
        }
    })
}

yapay.prototype.transfer = function(accessToken, sellerCpf, sellerEmail, value, cb) {
    const options = {
        url: this.url + '/v1/transactions/transfer',
        json: {
            access_token: accessToken,
            seller_cpf: sellerCpf.replace(/[^0-9]/g, ""),
            seller_email: sellerEmail,
            transfer_value: value
        }
    }

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            const json = JSON.parse(xmlParser.toJson(body));

            if (json.transaction.message_response.message === 'error') {
                return cb(json.transaction.error_response, false);
            } else if (json.transaction.message_response.message === 'success') {
                return cb(false, json.transaction.data_response);
            }
        }
    })
}

yapay.prototype.withdraws = function(accessToken, bankAccountId, value, cb) {
    const options = {
        url: this.url + '/v1/withdraws/create',
        json: {
            access_token: accessToken,
            bank_account_id: bankAccountId,
            cash_value: value
        }
    }

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            const json = JSON.parse(xmlParser.toJson(body));

            if (json.withdraw.message_response.message === 'error') {
                return cb(json.withdraw.error_response, false);
            } else if (json.withdraw.message_response.message === 'success') {
                return cb(false, json.withdraw.data_response);
            }
        }
    })
}

yapay.prototype.getWithdraw = function(accessToken, withdraw_id, cb) {
    const options = {
        url: this.url + '/v1/withdraws/get',
        json: {
            access_token: accessToken,
            withdraw_id: withdraw_id
        }
    }

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            const json = JSON.parse(xmlParser.toJson(body));

            console.log(json);

            if (json.withdraw.message_response.message === 'error') {
                return cb(json.withdraw.error_response, false);
            } else if (json.withdraw.message_response.message === 'success') {
                return cb(false, json.withdraw.data_response);
            }
        }
    })
}

yapay.prototype.createPeople = function(params, cb) {
    let json = {
        account_type: params.account_type,
        email: params.email,
        name: params.name,
        cpf: params.cpf.replace(/[^0-9]/g, ""),
        street: params.street,
        number: params.number,
        neighborhood: params.neighborhood,
        postal_code: params.postal_code.replace(/[^0-9]/g, ""),
        city: params.city,
        state: params.state,
        type_address: 'D',
        contacts: []
    };

    if (params.account_type === '1') {
        json.cpf = params.cpf.replace(/[^0-9]/g, "");
    } else if (params.account_type === '2') {
        json.trade_name = params.trade_name;
        json.company_name = params.company_name;
        json.name = params.company_name;
        json.cnpj = params.cnpj.replace(/[^0-9]/g, "");
        json.contacts.push({
            type_contact: 'W',
            number_contact: params.phone_number.replace(/[^0-9]/g, "")
        })
    }

    if (this.resellerToken) {
        json.reseller_token = this.resellerToken;
    }

    const options = {
        url: this.url + '/v1/people/create',
        json: json
    }

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            const json = JSON.parse(xmlParser.toJson(body));

            if (json.people.message_response.message === 'error') {
                return cb(json.people.error_response, false);
            } else if (json.people.message_response.message === 'success') {
                return cb(false, json.people.data_response);
            }
        }
    })
}

yapay.prototype.addProduct = function(item) {
    this.transactionData.transactionProduct.push({
        description: item.description,
        quantity: item.quantity,
        price_unit: item.price
    })
}

yapay.prototype.setCustomer = function(customer) {
    this.transactionData.customer.email = customer.email;
    if (customer.name) {
        this.transactionData.customer.name = customer.name;
    }

    if (customer.birth_date) {
        this.transactionData.customer.birth_date = customer.birth_date;
    }

    if (customer.cpf) {
        this.transactionData.customer.cpf = customer.cpf;
    }

    if (customer.phone_number) {
        this.transactionData.customer.contacts.push({
            type_contact: 'M',
            number_contact: customer.phone_number
        })
    }
}

yapay.prototype.setAddress = function(address) {
    this.transactionData.customer.addresses.push({
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
    this.transactionData.transaction.shipping_price = shipping.price;
    this.transactionData.transaction.shipping_type = shipping.type;
}

yapay.prototype.setDiscount = function(discount_value) {
    this.transactionData.transaction.price_discount = discount_value;
}

yapay.prototype.payment = function(params, cb) {
    let url;
    switch (this.mode) {
        case 'prod': url = 'https://api.intermediador.sandbox.yapay.com.br/api/v3/transactions/payment'; break;
        case 'sandbox': url = 'https://api.intermediador.sandbox.yapay.com.br/api/v3/transactions/payment'; break;
    }

    this.transactionData.token_account = this.token;
    if (this.resellerToken) {
        this.transactionData.reseller_token = this.resellerToken;
    }

    this.transactionData.payment = {
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
        json: this.transactionData
    }    

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            if (body.message_response.message === 'error') {
                return cb(body.error_response, false);
            } else if (body.message_response.message === 'success') {
                return cb(false, body.data_response);
            }
        }
    })
}

yapay.prototype.cancelTransaction = function(transactionId, cb) {
    const options = {
        url: this.url + '/v3/transactions/cancel',
        json: {
            access_token: this.accessToken,
            transaction_id: Number(transactionId),
            reason_cancellation_id: '6'
        }
    }    

    request.patch(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            if (body.message_response.message === 'error') {
                return cb(body.error_response, false);
            } else if (body.message_response.message === 'success') {
                return cb(false, body.data_response);
            }
        }
    })
}

yapay.prototype.getTransaction = function(token_transaction, cb) {
    const options = {
        url: this.url + '/v3/transactions/get_by_token?token_account=' + this.token + '&token_transaction=' + token_transaction
    }    

    request.get(options, (err, response, body) => { 
        if (err) {
            return cb(err, false);
        } else {
            body = JSON.parse(body);
            if (body.message_response.message === 'error') {
                return cb(body.error_response, false);
            } else if (body.message_response.message === 'success') {
                return cb(false, body.data_response);
            }
        }
    })
}

yapay.prototype.getSales = function(cb) {
    const options = {
        url: this.url + '/v3/sales',
        headers: {
            Authorization: `Token token=${this.accessToken}, type=access_token`
        }
    }

    request.get(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            if (body.message_response.message === 'error') {
                return cb(body.error_response, false);
            } else if (body.message_response.message === 'success') {
                return cb(false, body.data_response);
            }
        }
    })
}

yapay.prototype.createResellerCode = function(consumerKey, consumerSecret, cb) {
    const options = {
        url: this.url + '/v1/reseller/authorizations/create',
        json: {
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
            reseller_token: this.resellerToken,
            token_account: this.token,
            type_response: "J"
        }
    }

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            if (body.message_response.message === 'error') {
                return cb(body.error_response, false);
            } else if (body.message_response.message === 'success') {
                return cb(false, body.data_response);
            }
        }
    })
}

yapay.prototype.createResellerCodeWithToken = function(consumerKey, consumerSecret, token, cb) {
    const options = {
        url: this.url + '/v1/reseller/authorizations/create',
        json: {
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
            reseller_token: this.resellerToken,
            token_account: token,
            type_response: "J"
        }
    }

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            if (body.message_response.message === 'error') {
                return cb(body.error_response, false);
            } else if (body.message_response.message === 'success') {
                return cb(false, body.data_response);
            }
        }
    })
}

yapay.prototype.generateAccessToken = function(consumer_key, consumer_secret, code, cb) {
    const options = {
        url: this.url + '/v1/authorizations/access_token',
        json: {
            consumer_key: consumer_key,
            consumer_secret: consumer_secret,
            code: code,
            type_response: "J"
        }
    }

    request.post(options, (err, response, body) => {
        if (err) {
            return cb(err, false);
        } else {
            if (body.message_response.message === 'error') {
                return cb(body.error_response, false);
            } else if (body.message_response.message === 'success') {
                this.accessToken = body.data_response.authorization.access_token;
                return cb(false, body.data_response);
            }
        }
    })
}

function getPaymentMethodId(card_number) {
    //amex
    if (card_number.substring(0, 2) === '34' || card_number.substring(0, 2) === '37') {
        return '5';
    //visa
    } else if (card_number.substring(0, 1) === '4') {
        return '3';
    //mastercard
    } else if (card_number.substring(0, 1) === '5') {
        return '4';
    //diners
    } else if (card_number.substring(0, 3) === '301' || card_number.substring(0, 3) === '305' || card_number.substring(0, 2) === '36' || card_number.substring(0, 2) === '38') {
        return '2';
    //hipercard
    } else if (card_number.substring(0, 2) === '38' || card_number.substring(0, 2) === '60') {
        return '20';
    }
}

module.exports = yapay;