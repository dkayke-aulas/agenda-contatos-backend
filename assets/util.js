const { basePathData, usersFile, contactsFile } = require("./default.constant");
const { StatusCodes } = require("http-status-codes");
const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports = {
    jwtValidation,
    tratarReqResGenerico,
    tratarLog,
    validarEndereco,
    validarTelefones,
    validarParams
};

function jwtValidation(req, res, next) {
    try {
        const { JWT_SECRET } = process.env;
        const auth = req.headers.authorization;
        const token = auth.split(' ').join("").replace('Bearer', '');
        if (auth) {
            const decoded = jwt.verify(token, JWT_SECRET);
            res.locals = { idUsuario: decoded.user };
            console.info('JWT Middleware - Validação de Token: ' + decoded.user);
        }
        else return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Token não enviado" });
    }
    catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Erro na validação de Token JWT" });
    }
    next();
};

function tratarLog(req, _, next) {
    console.info('\nOriginal Url:', `${req.method}: ${req.originalUrl}`);
    console.info('Request Body:', req.body);
    console.log("");
    next();
}

function tratarReqResGenerico(req, res, next) {
    req.url = req.url.split('v1/').join("");

    if (!fs.existsSync(basePathData)) {
        fs.mkdirSync(basePathData);
        fs.closeSync(fs.openSync(usersFile, 'a'));
        fs.closeSync(fs.openSync(contactsFile, 'a'));
    }

    const json = res.json;
    res.json = function (obj) {
        let retorno;

        if (res.statusCode >= 400) {
            retorno = {
                mensagem: obj.msg || "Erro interno, tente novamente mais tarde!",
                erros: obj.erros
            };
        }
        else {
            retorno = { data: obj.data || obj };
        }

        json.call(this, Object.assign(retorno, { status: res.statusCode }));
    };

    next();
}

function validarEndereco(endereco) {
    const end = {
        logradouro: endereco && endereco.logradouro,
        cidade: endereco && endereco.cidade,
        estado: endereco && endereco.estado,
        cep: endereco && endereco.cep,
        pais: endereco && endereco.pais
    };

    const keys = Object.keys(end);
    const erros = [];

    keys.forEach(key => {
        if (typeof endereco[key] !== 'string') {
            erros.push(`Parâmetro '${key}' deve ser uma string`);
        }
    });

    return {
        status: erros.length > 0 && { erros, msg: "Endereço deve ser um objeto com as propriedades { logradouro: string, cidade: string, estado: string, cep: string, pais: string }" },
        possuiErro: erros.length > 0
    };
}

function validarTelefones(telefones) {
    let possuiErro = !Array.isArray(telefones);

    if (!possuiErro && telefones && telefones.length) {
        const filter = telefones.filter(telefone => {
            return typeof telefone.numero !== 'string' || (telefone.tipo !== 'casa' && telefone.tipo !== 'celular' && telefone.tipo !== 'trabalho');
        });
        possuiErro = Boolean(filter.length);
    }

    return {
        status: possuiErro && { msg: "Telefones deve ser um array de objeto com as propriedades { tipo: 'casa' | 'celular' | 'trabalho', numero: string }" },
        possuiErro: possuiErro
    };
}

function validarParams(params) {

    const keys = Object.keys(params || {});
    const erros = [];

    function todosObrigatorios() {
        keys.forEach(key => {
            if (params[key] === null || params[key] === undefined || params[key] === '') {
                erros.push(`Parâmetro '${key}' não pode ser null/undefined ou vazio`);
            }
        });

        return {
            status: { erros, msg: "Requisição inválida, verifique a lista de erros" },
            possuiErro: erros.length > 0
        };
    }

    function idObrigatorio(contexto) {
        return {
            status: !params.id && { msg: `ID de ${contexto} deve ser informado` },
            possuiErro: !params.id
        };
    }

    function aoMenosUmEId(contexto) {
        const validacaoId = idObrigatorio(contexto);
        if (validacaoId.possuiErro) return validacaoId;

        keys.forEach(key => {
            if (params[key] === null || params[key] === undefined || params[key] === '') {
                erros.push(`Parâmetro '${key}' não pode ser null/undefined ou vazio`);
            }
        });

        return {
            status: { erros, msg: "Requisição inválida, ao menos um dos parâmetros da lista de erros deve ser enviado" },
            possuiErro: erros.length === keys.length - 1
        };
    }


    return {
        todosObrigatorios,
        aoMenosUmEId,
        idObrigatorio
    }
}