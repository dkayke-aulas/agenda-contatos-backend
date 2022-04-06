require('dotenv').config();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const express = require('express');
const uuid = require('uuid').v4;
const cors = require('cors');
const { StatusCodes } = require('http-status-codes');
const { usersFile, contactsFile, imgUserDafault } = require('./assets/default.constant');
const { jwtValidation, validarParams, tratarReqResGenerico, validarEndereco, validarTelefones, tratarLog } = require('./assets/util');

const app = express()

app.use(cors({ origin: true }));
app.use(express.json());
app.use(tratarReqResGenerico);
app.use(tratarLog);

// Autenticar usuário
app.post('/auth', (req, res) => {

    const { email, senha } = req.body;

    try {
        const { JWT_SECRET } = process.env;
        const dados = { email, senha };
        const validacao = validarParams(dados).todosObrigatorios();

        if (validacao.possuiErro) {
            return res.status(StatusCodes.BAD_REQUEST).json(validacao.status);
        }

        const arquivo = fs.readFileSync(usersFile, 'utf8');
        const usuarios = JSON.parse(arquivo || "[]");
        const usuario = usuarios.find(u => u.email === email && u.senha === senha);

        if (!usuario) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Autenticação inválida" });
        }

        delete usuario.senha;
        usuario.token = jwt.sign({ user: `${usuario.id}` }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(StatusCodes.OK).json(usuario);
    }
    catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erros: [err] });
    }
});

// Criar usuário
app.post('/user', (req, res) => {

    const { email, senha, nome, foto = imgUserDafault } = req.body;

    try {
        const dados = { email, senha, nome, foto };
        const validacao = validarParams(dados).todosObrigatorios();

        if (validacao.possuiErro) {
            return res.status(StatusCodes.BAD_REQUEST).json(validacao.status);
        }

        const arquivo = fs.readFileSync(usersFile, 'utf8');
        const usuarios = JSON.parse(arquivo || "[]");
        const usuario = usuarios.find(u => u.email === email);

        if (usuario) {
            return res.status(StatusCodes.CONFLICT).json({ msg: "E-mail já cadastrado" });
        }

        const novoUsuario = { id: uuid(), ...dados };
        usuarios.push(novoUsuario);

        fs.writeFileSync(usersFile, JSON.stringify(usuarios));

        delete novoUsuario.senha;
        return res.status(StatusCodes.OK).json(novoUsuario);
    }
    catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erros: [err] });
    }
});

// Atualizar usuário
app.patch('/user', jwtValidation, (req, res) => {

    const { email, senha, nome, foto } = req.body;
    const { idUsuario } = res.locals;

    try {
        const dados = { id: idUsuario, email, senha, nome, foto };
        const validacao = validarParams(dados).aoMenosUmEId("usuário");

        if (validacao.possuiErro) {
            return res.status(StatusCodes.BAD_REQUEST).json(validacao.status);
        }

        const arquivo = fs.readFileSync(usersFile, 'utf8');
        const usuarios = JSON.parse(arquivo || "[]");
        const index = usuarios.findIndex(u => u.id === idUsuario);

        if (index < 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: "Usuário não encontrado" });
        }

        Object.keys(dados).forEach(key => {
            if (!dados[key]) delete dados[key];
        });

        usuarios[index] = Object.assign(usuarios[index], dados);

        fs.writeFileSync(usersFile, JSON.stringify(usuarios));

        delete usuarios[index].senha;
        return res.status(StatusCodes.OK).json(usuarios[index]);
    }
    catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erros: [err] });
    }
});

// Deletar usuário
app.delete('/user', jwtValidation, (req, res) => {

    const { idUsuario } = req.body;
    const { idUsuario: idUsuarioToken } = res.locals;

    try {
        if (idUsuario !== idUsuarioToken) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Autenticação inválida"});
        }

        const dados = { id: idUsuario };
        const validacao = validarParams(dados).idObrigatorio("usuário");

        if (validacao.possuiErro) {
            return res.status(StatusCodes.BAD_REQUEST).json(validacao.status);
        }

        const arquivo = fs.readFileSync(usersFile, 'utf8');
        const usuarios = JSON.parse(arquivo || "[]");
        const index = usuarios.findIndex(u => u.id === idUsuario);

        if (index < 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: "Usuário não encontrado" });
        }

        usuarios.splice(index, 1);

        fs.writeFileSync(usersFile, JSON.stringify(usuarios));
        return res.status(StatusCodes.OK).json({ data: { sucesso: true, msg: "Usuário deletado com sucesso" } });
    }
    catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erros: [err] });
    }
});

// Buscar contato(s)
app.get('/contact/:id?', jwtValidation, (req, res) => {

    const { id } = req.params;
    const { idUsuario } = res.locals;

    try {
        const arquivo = fs.readFileSync(contactsFile, 'utf8');
        const contatos = JSON.parse(arquivo || "[]");

        const contatosFiltrado = contatos.filter(contato => {
            return contato.idUsuario === idUsuario;
        })

        if(!id) {
            return res.status(StatusCodes.OK).json(contatosFiltrado);
        } 

        const contatoFiltrado = contatos.find(contato => {
            return contato.id === id && contato.idUsuario === idUsuario;
        });

        return res.status(StatusCodes.OK).json(contatoFiltrado || {});
    }
    catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erros: [err] });
    }
});

// Criar contato
app.post('/contact', jwtValidation, (req, res) => {

    const { nome, apelido, telefones, email, endereco, notas, foto = imgUserDafault } = req.body;
    const { idUsuario } = res.locals;

    try {
        const dados = { nome };

        const validacao = validarParams(dados).todosObrigatorios();
        if (validacao.possuiErro) {
            return res.status(StatusCodes.BAD_REQUEST).json(validacao.status);
        }

        if (endereco !== null && endereco !== undefined) {
            const validacaoEndereco = validarEndereco(endereco);
            if (validacaoEndereco.possuiErro) {
                return res.status(StatusCodes.BAD_REQUEST).json(validacaoEndereco.status);
            }
        }

        if (telefones !== null && telefones !== undefined) {
            const validacaoTelefones = validarTelefones(telefones);
            if (validacaoTelefones.possuiErro) {
                return res.status(StatusCodes.BAD_REQUEST).json(validacaoTelefones.status);
            }
        }

        Object.assign(dados, {
            id: uuid(),
            nome,
            idUsuario,
            apelido: apelido || "",
            email: email || "",
            notas: notas || "",
            telefones: telefones || [],
            endereco: endereco || { logradouro: "", cidade: "", estado: "", cep: "", pais: "" },
            foto: foto || imgUserDafault
        });

        const arquivo = fs.readFileSync(contactsFile, 'utf8');
        const contatos = JSON.parse(arquivo || "[]");

        contatos.push(dados);

        fs.writeFileSync(contactsFile, JSON.stringify(contatos));
        return res.status(StatusCodes.OK).json(dados);
    }
    catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erros: [err] });
    }
});

// Atualizar contato
app.patch('/contact', jwtValidation, (req, res) => {

    const { idContato, nome, apelido, telefones, email, endereco, notas, foto } = req.body;
    const { idUsuario } = res.locals;

    try {
        const dados = { id: idContato, nome, apelido, telefones, email, endereco, notas, foto };

        const validacao = validarParams(dados).aoMenosUmEId("contato");
        if (validacao.possuiErro) {
            return res.status(StatusCodes.BAD_REQUEST).json(validacao.status);
        }

        if (endereco !== null && endereco !== undefined) {
            const validacaoEndereco = validarEndereco(endereco);
            if (validacaoEndereco.possuiErro) {
                return res.status(StatusCodes.BAD_REQUEST).json(validacaoEndereco.status);
            }
        }

        if (telefones !== null && telefones !== undefined) {
            const validacaoTelefones = validarTelefones(telefones);
            if (validacaoTelefones.possuiErro) {
                return res.status(StatusCodes.BAD_REQUEST).json(validacaoTelefones.status);
            }
        }

        const arquivo = fs.readFileSync(contactsFile, 'utf8');
        const contatos = JSON.parse(arquivo || "[]");
        const index = contatos.findIndex(c => c.id === idContato && c.idUsuario === idUsuario);

        if (index < 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: "Contato não encontrado" });
        }

        Object.keys(dados).forEach(key => {
            if (!dados[key]) delete dados[key];
        });

        contatos[index] = Object.assign(contatos[index], dados);

        fs.writeFileSync(contactsFile, JSON.stringify(contatos));
        return res.status(StatusCodes.OK).json(contatos[index]);
    }
    catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erros: [err] });
    }
});

// Deletar contato
app.delete('/contact', jwtValidation, (req, res) => {

    const { idContato } = req.body;
    const { idUsuario } = res.locals;

    try {
        if (!idUsuario) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Autenticação inválida"});
        }

        const dados = { id: idContato };
        const validacao = validarParams(dados).idObrigatorio("contato");

        if (validacao.possuiErro) {
            return res.status(StatusCodes.BAD_REQUEST).json(validacao.status);
        }

        const arquivo = fs.readFileSync(contactsFile, 'utf8');
        const contatos = JSON.parse(arquivo || "[]");
        const index = contatos.findIndex(c => c.id === idContato && c.idUsuario === idUsuario);

        if (index < 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: "Contato não encontrado" });
        }

        contatos.splice(index, 1);

        fs.writeFileSync(contactsFile, JSON.stringify(contatos));
        return res.status(StatusCodes.OK).json({ data: { sucesso: true, msg: "Contato deletado com sucesso" } });
    }
    catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erros: [err] });
    }
});

app.listen(5000, () => console.log('listening on http://localhost:5000'));