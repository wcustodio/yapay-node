const yapay = function(params) {
    this.token = params.token;
    this.mode = params.sandbox == true ? 'sandbox' : 'prod';

    switch (this.mode) {
        case 'prod': this.url = 'http://api.intermediador.yapay.com.br/v1'; break;
        case 'sandbox': this.url = 'https://api.intermediador.sandbox.yapay.com.br/v1'; break;
    }
}

module.exports = yapay;