
# yapay-node
Biblioteca de integração do intermediador Yapay para Node.js

## Instalação
`npm install yapay-node`

## Como Usar

### Criar objeto
Para criar o objeto principal, informe o token de cliente nos parâmetros do construtor. Opcionalmente, é possível habilitar o modo sandbox

```javascript
var Yapay = require('yapay-node');

var yapay = new Yapay({
   token: 'ABCDEFGH12345678ABCDEFGH12345678',
   sandbox: true //opcional, default = false
})
```