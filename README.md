
# yapay-node
Biblioteca de integração do intermediador Yapay para Node.js

## Instalação
`npm install yapay-node`

## Como Usar

### Configuração
Para configurar o objeto, informe o token de cliente nos parâmetros do construtor. Opcionalmente, é possível habilitar o modo sandbox

```javascript
const Yapay = require('yapay-node');

let yapay = new Yapay({
   token: 'ABCDEFGH12345678ABCDEFGH12345678',
   sandbox: true //opcional, default = false
})
```

### Simular Parcelamento
```javascript
yapay.simulateSplitting(value, (err, data) => {

});
```

### Consultar Cliente
Faz consulta do cliente a partir do CPF ou e-mail
```javascript
yapay.getPerson({ email: String, cpf: String}, (err, data) => {

})
```