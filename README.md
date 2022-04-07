# API Agenda Eletrônica de Contatos
![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)

Essa API tem como objetivo persistir dados para gerenciamento de uma agenda eletrônica, com intuito acadêmico de ensino de front-end. A gravação dos dados é efetuada em arquivos de extensão JSON dentro do próprio projeto, sem quaisquer meios de ofuscação das informações.
<br/><br/>
Os arquivos JSON são gerados automaticamente dentro da raíz do projeto em uma pasta nomeada "dados"
<br/><br/>

##
### Iniciar o servidor
Para inicializar o backend, execute os seguintes comandos a partir da raiz desse repositório.

<br/>

Executando servidor Node
```sh
npm i
npm run start
```

<br/>

Executando servidor Nodemon
```sh
npm i
npm run dev
```

Ele responderá às requisições em na porta 5000 caso não esteja em uso.

```sh
http://127.0.0.1:5000/v1/
```

ou 

```sh
http://localhost:5000/v1/
```
<br/>

##
### Endpoints

**Auth** <br/>
[`POST /auth`](#post-auth) - Autenticação de usuário (login)
<br/><br/>

**User** <br/>
[`POST /user`](#post-user) - Criação de um novo usuário <br/>
[`PATCH /user`](#patch-user) - Atualização de dados de um usuário <br/>
[`DELETE /user`](#delete-user) - Deleção de um usuário
<br/><br/>

**Contact** <br/>
[`GET /contact`](#get-contact) Busca de todos contatos <br/>
[`GET /contact/:id`](#get-contactid) Busca de específico <br/>
[`POST /contact`](#post-contact) Criação de um novo contato <br/>
[`PATCH /contact`](#patch-contact) Atualização de dados de um contato <br/>
[`DELETE /contact`](#delete-contact) - Deleção de um contato
<br/>

##
### POST auth

**Request**

|**Nome**|**Obrigatório**|**Tipo**|**Descrição**|
| :------------ | :------------ | :------------ | :------------ |
|email|sim|`string`|E-mail ou nome de usuário|
|senha|sim|`string`|Senha|

<br />

> **_NOTA:_**  Não é necessário enviar Token JWT via Authorization Header.

<br />

**Response**

Sucesso
```json
{
    "data": {
        "id": "97ed7436-9cab-4924-8101-682ac7106e86",
        "email": "teste@email.com",
        "nome": "Bill Gates",
        "foto": "data:image/png;base64,abcdefghijklmnopqrstuvwxyz",
        "token": "abcdefghijklmnopqrstuvwxyz"
    },
    "status": 200
}
```

<br /> Erro comum
```json
{
    "mensagem": "Autenticação inválida",
    "status": 401
}
```
<br/>

##
### POST user

**Request**

|**Nome**|**Obrigatório**|**Tipo**|**Descrição**|
| :------------ | :------------ | :------------ | :------------ |
|email|sim|`string`|E-mail ou nome de usuário|
|senha|sim|`string`|Senha|
|nome|sim|`string`|Nome para perfil|
|foto|não|`string` (base64)|Foto para perfil |

<br />

> **_NOTA:_**  Não é necessário enviar Token JWT via Authorization Header.

<br />

**Response**

Sucesso
```json
{
    "data": {
        "id": "97ed7436-9cab-4924-8101-682ac7106e86",
        "email": "teste@email.com",
        "nome": "Bill Gates",
        "foto": "data:image/png;base64,abcdefghijklmnopqrstuvwxyz"
	},
    "status": 200
}
```

<br /> Erro comum
```json
{
    "mensagem": "E-mail já cadastrado",
    "status": 409
}
```
<br/>

##
### PATCH user

**Request**

|**Nome**|**Obrigatório**|**Tipo**|**Descrição**|
| :------------ | :------------ | :------------ | :------------ |
|email|parcial|`string`|Novo e-mail ou nome de usuário|
|senha|parcial|`string`|Nova senha|
|nome|parcial|`string`|Novo nome para perfil|
|foto|parcial|`string` (base64)|Nova foto para perfil |

<br />

> **_NOTA:_**  É necessário enviar Token JWT via Authorization Header. Não é necessário eviar o ID do usuário, pois ele já existe no Token JWT do Authorization Header.

<br />

**Response**

Sucesso
```json
{
    "data": {
        "id": "97ed7436-9cab-4924-8101-682ac7106e86",
        "email": "teste-novo-email@email.com",
        "nome": "Bill",
        "foto": "data:image/png;base64,abcdefghijklmnopqrstuvwxyz"
	},
    "status": 200
}
```

<br /> Erro comum
```json
{
    "mensagem": "Usuário não encontrado",
    "status": 404
}
```
<br/>

##
### DELETE user

**Request**

|**Nome**|**Obrigatório**|**Tipo**|**Descrição**|
| :------------ | :------------ | :------------ | :------------ |
|idUsuario|sim|`string` (UUID v4)|ID do usuário, apenas o próprio usuário pode deletar a conta|

<br />

> **_NOTA:_**  É necessário enviar Token JWT via Authorization Header. É necessário passar o ID do usuário para dupla validação (já existe no token enviado no header) antes da deleção do dado.

<br />

**Response**

Sucesso
```json
{
    "data": {
        "sucesso": true,
        "msg": "Usuário deletado com sucesso"
    },
    "status": 200
}
```

<br /> Erro comum
```json
{
    "mensagem": "Autenticação inválida",
    "status": 400
}
```
<br/>

##
### GET contact

**Request**

Buscar todos contatos
|**Nome**|**Obrigatório**|**Tipo**|**Descrição**|
| :------------ | :------------ | :------------ | :------------ |
|-|-|-|Não é necessário enviar nenhum parâmetro|

<br />

> **_NOTA:_**  É necessário enviar Token JWT via Authorization Header.

<br />

**Response**

Sucesso
```json
{
    "data": [
        {
            "id": "9892b7b3-45d0-4dfa-a8d3-d32e54392b2f",
            "nome": "Amanda",
            "idUsuario": "d5b07480-02dc-423a-a598-4c5564e1b9b7",
            "apelido": "",
            "email": "",
            "notas": "",
	    "foto": "data:image/png;base64,abcdefghijklmnopqrstuvwxyz",
            "telefones": [
                {
                    "tipo": "casa",
                    "numero": "+55 011 91234-5678"
                }
            ],
            "endereco": {
                "logradouro": "string",
                "cidade": "string",
                "estado": "string",
                "cep": "string",
                "pais": "string"
            }
        },
        {
            "id": "9b513dd1-7e29-4ce0-9a73-5c622bc21c96",
            "nome": "Dannyel",
            "idUsuario": "d5b07480-02dc-423a-a598-4c5564e1b9b7",
            "apelido": "",
            "email": "",
            "notas": "",
	    "foto": "data:image/png;base64,abcdefghijklmnopqrstuvwxyz",
            "telefones": [
                {
                    "tipo": "celular",
                    "numero": "+55 011 91234-5679"
                },
                {
                    "tipo": "trabalho",
                    "numero": "+55 011 91234-5670"
                }
            ],
            "endereco": {
                "logradouro": "string",
                "cidade": "string",
                "estado": "string",
                "cep": "string",
                "pais": "string"
            }
        }
    ],
    "status": 200
}
```

<br /> Sucesso sem retorno de dados
```json
{
    "data": [],
    "status": 200
}
```
<br/>

##
### GET contact/:id

**Request**

Buscar contato específico
|**Nome**|**Obrigatório**|**Tipo**|**Descrição**|
| :------------ | :------------ | :------------ | :------------ |
|id|sim|`string`|Enviar via parâmetro de rota|

<br />

> **_NOTA:_**  É necessário enviar Token JWT via Authorization Header.

<br />

**Response**

Sucesso
```json
{
    "data": {
        "id": "9892b7b3-45d0-4dfa-a8d3-d32e54392b2f",
        "nome": "Amanda",
        "idUsuario": "d5b07480-02dc-423a-a598-4c5564e1b9b7",
        "apelido": "",
        "email": "",
        "notas": "",
	"foto": "data:image/png;base64,abcdefghijklmnopqrstuvwxyz",
        "telefones": [
            {
                "tipo": "casa",
                "numero": "+55 011 91234-5678"
            }
        ],
        "endereco": {
            "logradouro": "string",
            "cidade": "string",
            "estado": "string",
            "cep": "string",
            "pais": "string"
        }
    },
    "status": 200
}
```

<br />Sucesso sem retorno de dados
```json
{
    "data": {},
    "status": 200
}
```
<br/>

##
### POST contact

**Request**

|**Nome**|**Obrigatório**|**Tipo**|**Descrição**|
| :------------ | :------------ | :------------ | :------------ |
|nome|sim|`string`|Nome do contato|
|apelido|não|`string`|Apelido do contato|
|telefones|não|`array of object`|Todos telefones do contato<br/><br/> Cada objeto deve conter duas propriedades obrigatórias, são elas<br/><br/> **tipo** que deve ser string com os valores `casa` &#124; `trabalho` &#124; `celular` <br/><br/> **numero** que deve ser `string`, com o número do telefone em si|
|email|não|`string`|E-mail do contato|
|endereco|não|`objeto`|Endereço do contato<br/><br/> O objeto deve possuir as seguintes propriedades obrigatórias, que, porém permite-se a entrada do dado vazio: <br/><br/> **logradouro**: `string` <br/> **cidade**: `string` <br/> **estado**: `string` <br/> **cep**: `string` <br/> **pais**: `string` <br/> |
|notas|não|`string`|Observações relevantes do contato|
|foto|não|`string` (base64)|Nova foto para perfil |

<br />

> **_NOTA:_**  É necessário enviar Token JWT via Authorization Header.

<br />

**Response**

Sucesso
```json
{
    "data": {
        "nome": "Dannyel",
        "id": "c5fe8018-9741-431d-93d8-c05960f147df",
        "idUsuario": "d5b07480-02dc-423a-a598-4c5564e1b9b7",
        "apelido": "",
        "email": "",
        "notas": "",
	"foto": "data:image/png;base64,abcdefghijklmnopqrstuvwxyz",
        "telefones": [
            {
                "tipo": "celular",
                "numero": "+55 011 91234-5679"
            },
            {
                "tipo": "trabalho",
                "numero": "+55 011 91234-5670"
            }
        ],
        "endereco": {
            "logradouro": "string",
            "cidade": "string",
            "estado": "string",
            "cep": "string",
            "pais": "string"
        }
    },
    "status": 200
}
```
<br/>

##
### PATCH contact

**Request**

|**Nome**|**Obrigatório**|**Tipo**|**Descrição**|
| :------------ | :------------ | :------------ | :------------ |
|idContato|sim|`string` (UUID v4)|ID do contato que será atualizado|
|nome|parcial|`string`|Novo nome do contato|
|apelido|parcial|`string`|Novo apelido do contato|
|telefones|parcial|`array of object`|Todos telefones do contato, com os números atualizados<br/><br/> Cada objeto deve conter duas propriedades obrigatórias, são elas<br/><br/> **tipo** que deve ser string com os valores `casa` &#124; `trabalho` &#124; `celular` <br/><br/> **numero** que deve ser `string`, com o número do telefone em si|
|email|parcial|`string`|Novo e-mail do contato|
|endereco|parcial|`objeto`|Novo endereço do contato<br/><br/> O objeto deve possuir as seguintes propriedades obrigatórias, que, porém permite-se a entrada do dado vazio: <br/><br/> **logradouro**: `string` <br/> **cidade**: `string` <br/> **estado**: `string` <br/> **cep**: `string` <br/> **pais**: `string` <br/> |
|notas|parcial|`string`|Observações relevantes do contato|
|foto|parcial|`string` (base64)|Nova foto para perfil |

<br />

> **_NOTA:_**  É necessário enviar Token JWT via Authorization Header.

<br />

**Response**

Sucesso
```json
{
    "data": {
        "nome": "Kayke",
        "id": "c5fe8018-9741-431d-93d8-c05960f147df",
        "idUsuario": "d5b07480-02dc-423a-a598-4c5564e1b9b7",
        "apelido": "",
        "email": "",
        "notas": "",
	"foto": "data:image/png;base64,abcdefghijklmnopqrstuvwxyz",
        "telefones": [
            {
                "tipo": "celular",
                "numero": "+55 011 91234-5679"
            },
            {
                "tipo": "trabalho",
                "numero": "+55 011 91234-5670"
            }
        ],
        "endereco": {
            "logradouro": "string",
            "cidade": "string",
            "estado": "string",
            "cep": "string",
            "pais": "string"
        }
    },
    "status": 200
}
```
<br/>

##
### DELETE contact

**Request**

|**Nome**|**Obrigatório**|**Tipo**|**Descrição**|
| :------------ | :------------ | :------------ | :------------ |
|idContato|sim|`string` (UUID v4)|ID do contato que será deletado|

<br />

> **_NOTA:_**  É necessário enviar Token JWT via Authorization Header.

<br />

**Response**

Sucesso
```json
{
    "data": {
        "sucesso": true,
        "msg": "Contato deletado com sucesso"
    },
    "status": 200
}
```
<br/>

##
### Erros Comuns

O Erro abaixo pode ser ocasionado por erro de sintaxe ou lógica no backend, bem como o erro pode ser causado devido ao envio incorreto de parâmetros para o backend. Caso observe este erro, por favor, reporte-o.
```json
{
    "mensagem": "Erro interno, tente novamente mais tarde!",
    "erros": [
        {}
    ],
    "status": 500
}
```

<br />
Os dois erros abaixo podem ser ocasionados devido ao envio incorreto do header "authorization" ou devido à expiração do token.

```json
{
    "mensagem": "Erro na validação de Token JWT",
    "status": 401
}
```

```json
{
    "mensagem": "ID de usuário deve ser informado",
    "status": 400
}
```

<br />
Caso você obtenha o erro abaixo no terminal, significa que já existe um outro terminal rodando a porta 5000 no seu projeto, você pode achar este terminal e encerrar o processo ou alterar a porta na última linha do index.js.

```Terminal
$ npm run dev

> agenda-contatos-backend@0.0.1 dev C:\Users\danny\LetsCode\agenda-contatos-backend
> nodemon index.js

[nodemon] 2.0.7
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node index.js`
events.js:352
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use :::5000
    at Server.setupListenHandle [as _listen2] (net.js:1320:16)
    at listenInCluster (net.js:1368:12)
    at Server.listen (net.js:1454:7)
    at Function.listen (C:\Users\danny\LetsCode\agenda-contatos-backend\node_modules\express\lib\application.js:618:24)
    at Object.<anonymous> (C:\Users\danny\LetsCode\agenda-contatos-backend\index.js:325:5)
    at Module._compile (internal/modules/cjs/loader.js:1085:14)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1114:10)
    at Module.load (internal/modules/cjs/loader.js:950:32)
    at Function.Module._load (internal/modules/cjs/loader.js:790:14)
    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:76:12)
Emitted 'error' event on Server instance at:
    at emitErrorNT (net.js:1347:8)
    at processTicksAndRejections (internal/process/task_queues.js:82:21) {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 5000
}
[nodemon] app crashed - waiting for file changes before starting...

```
<br/>

##
### Licença

MIT
