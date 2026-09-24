const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('./db'); // conexão com PostgreSQL
const cepService = require('./services/cepService');

// Nº de "voltas" do hash. 10 é o padrão recomendado pelo bcrypt.
const BCRYPT_SALT_ROUNDS = 10;

// Remove a senha (hash) de qualquer objeto de cliente antes de
// devolver ao frontend — nunca deve trafegar pela rede/localStorage.
function removerSenha(cliente) {
    if (!cliente) return cliente;
    const { senha_cliente, ...resto } = cliente;
    return resto;
}

// =====================================================
// INTEGRAÇÕES EXTERNAS (ViaCEP, CNPJá, FIPE, Brasil API)
// Fica tudo acessível em /api/integracoes/...
// =====================================================
router.use('/integracoes', require('./routes/integracoes'));
router.use('/recuperar-senha', require('./routes/recuperarSenha'));

// =====================================================
// CLIENTES
// =====================================================

// LISTAR CLIENTES
router.get('/clientes', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM clientes ORDER BY id_cliente'
        );

        res.json(result.rows.map(removerSenha));

    } catch (err) {
        console.error('Erro ao listar clientes:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});



// CADASTRAR CLIENTE
router.post('/clientes', async (req, res) => {
    try {

        const {
            nome_cliente,
            endereco_cliente,
            telefone_cliente,
            email_cliente,
            senha_cliente
        } = req.body;

        if (!senha_cliente) {
            return res.status(400).json({
                erro: 'Senha é obrigatória.'
            });
        }

        const senhaHash = await bcrypt.hash(
            senha_cliente,
            BCRYPT_SALT_ROUNDS
        );

        const sql = `
            INSERT INTO clientes
            (
                nome_cliente,
                endereco_cliente,
                telefone_cliente,
                email_cliente,
                senha_cliente
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const result = await db.query(sql, [
            nome_cliente,
            endereco_cliente,
            telefone_cliente,
            email_cliente,
            senhaHash
        ]);

        res.status(201).json(
            removerSenha(result.rows[0])
        );

    } catch (err) {
        console.error('Erro ao cadastrar cliente:', err);

        // e-mail duplicado (constraint UNIQUE), se existir no schema
        if (err.code === '23505') {
            return res.status(409).json({
                erro: 'Já existe uma conta com este e-mail.'
            });
        }

        res.status(500).json({
            erro: err.message
        });
    }
});


// LOGIN CLIENTE
// =====================================================
router.post('/login', async (req, res) => {
    try {
        const {
            email_cliente,
            senha_cliente
        } = req.body;

        if (!email_cliente || !senha_cliente) {
            return res.json({
                success: false,
                message: 'Informe e-mail e senha.'
            });
        }

        const sql = `
            SELECT *
            FROM clientes
            WHERE email_cliente = $1
        `;

        const result = await db.query(sql, [
            email_cliente
        ]);

        const cliente = result.rows[0];

        if (!cliente) {
            return res.json({
                success: false,
                message: 'Login inválido'
            });
        }

        const hashArmazenado = cliente.senha_cliente || '';

        // bcrypt hashes sempre começam com $2 (ex.: $2a$, $2b$).
        // Se não começar assim, é uma senha antiga em texto puro
        // (contas criadas antes desta correção) — comparamos direto
        // e, se bater, migramos silenciosamente para um hash.
        const pareceHash = hashArmazenado.startsWith('$2');

        let autenticado = false;

        if (pareceHash) {

            autenticado = await bcrypt.compare(
                senha_cliente,
                hashArmazenado
            );

        } else if (hashArmazenado === senha_cliente) {

            autenticado = true;

            // migra a senha antiga (texto puro) para hash agora que
            // sabemos que o cliente digitou a senha certa
            const novoHash = await bcrypt.hash(
                senha_cliente,
                BCRYPT_SALT_ROUNDS
            );

            await db.query(
                'UPDATE clientes SET senha_cliente = $1 WHERE id_cliente = $2',
                [novoHash, cliente.id_cliente]
            );
        }

        if (autenticado) {

            res.json({
                success: true,
                user: removerSenha(cliente)
            });

        } else {

            res.json({
                success: false,
                message: 'Login inválido'
            });

        }

    } catch (err) {

        console.error('Erro no login:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// =====================================================
// FORNECEDORES
// =====================================================

// LISTAR FORNECEDORES
router.get('/fornecedores', async (req, res) => {
    try {

        const result = await db.query(
            'SELECT * FROM fornecedores ORDER BY id_fornecedor'
        );

        res.json(result.rows);

    } catch (err) {

        console.error('Erro ao listar fornecedores:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});



// CADASTRAR FORNECEDOR
router.post('/fornecedores', async (req, res) => {
    try {

        const {
            nome_fornecedor,
            endereco_fornecedor,
            telefone_fornecedor,
            email_fornecedor,
            cep_fornecedor
        } = req.body;

        // Se um CEP foi informado, já geocodificamos aqui (Brasil API)
        // e guardamos lat/lon. Assim a disponibilidade por CEP do
        // cliente não precisa geocodificar o fornecedor a cada request.
        const localizacao = await geocodarCepOuNulo(cep_fornecedor);

        const sql = `
            INSERT INTO fornecedores
            (
                nome_fornecedor,
                endereco_fornecedor,
                telefone_fornecedor,
                email_fornecedor,
                cep_fornecedor,
                latitude_fornecedor,
                longitude_fornecedor
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const result = await db.query(sql, [
            nome_fornecedor,
            endereco_fornecedor,
            telefone_fornecedor,
            email_fornecedor,
            localizacao.cep,
            localizacao.latitude,
            localizacao.longitude
        ]);

        res.status(201).json(result.rows[0]);

    } catch (err) {

        console.error('Erro ao cadastrar fornecedor:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// ATUALIZAR FORNECEDOR (inclui reprocessar o CEP se ele mudar)
router.patch('/fornecedores/:id', async (req, res) => {
    try {

        const { id } = req.params;

        const {
            nome_fornecedor,
            endereco_fornecedor,
            telefone_fornecedor,
            email_fornecedor,
            cep_fornecedor
        } = req.body;

        const atual = await db.query(
            'SELECT * FROM fornecedores WHERE id_fornecedor = $1',
            [id]
        );

        if (atual.rows.length === 0) {
            return res.status(404).json({
                erro: 'Fornecedor não encontrado'
            });
        }

        const cepMudou =
            cep_fornecedor !== undefined &&
            cepService.limparCep(cep_fornecedor) !==
                cepService.limparCep(atual.rows[0].cep_fornecedor);

        const localizacao = cepMudou
            ? await geocodarCepOuNulo(cep_fornecedor)
            : {
                cep: atual.rows[0].cep_fornecedor,
                latitude: atual.rows[0].latitude_fornecedor,
                longitude: atual.rows[0].longitude_fornecedor
            };

        const sql = `
            UPDATE fornecedores
            SET
                nome_fornecedor = COALESCE($1, nome_fornecedor),
                endereco_fornecedor = COALESCE($2, endereco_fornecedor),
                telefone_fornecedor = COALESCE($3, telefone_fornecedor),
                email_fornecedor = COALESCE($4, email_fornecedor),
                cep_fornecedor = $5,
                latitude_fornecedor = $6,
                longitude_fornecedor = $7
            WHERE id_fornecedor = $8
            RETURNING *
        `;

        const result = await db.query(sql, [
            nome_fornecedor,
            endereco_fornecedor,
            telefone_fornecedor,
            email_fornecedor,
            localizacao.cep,
            localizacao.latitude,
            localizacao.longitude,
            id
        ]);

        res.json(result.rows[0]);

    } catch (err) {

        console.error('Erro ao atualizar fornecedor:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// Geocodifica um CEP e devolve { cep, latitude, longitude }.
// Nunca lança erro: se o CEP vier vazio ou inválido, ou se a API
// externa falhar, devolve tudo null — o cadastro não pode travar
// por causa de uma integração externa fora do ar.
async function geocodarCepOuNulo(cepBruto) {

    if (!cepBruto) {
        return { cep: null, latitude: null, longitude: null };
    }

    try {

        const endereco = await cepService.buscarCep(cepBruto);

        return {
            cep: endereco.cep,
            latitude: endereco.latitude,
            longitude: endereco.longitude
        };

    } catch (err) {

        console.warn(
            'Não foi possível geocodificar o CEP do fornecedor:',
            err.message
        );

        return {
            cep: cepService.formatarCep(cepBruto),
            latitude: null,
            longitude: null
        };

    }

}


// =====================================================
// PRODUTOS
// =====================================================

// LISTAR PRODUTOS
// Aceita ?cep=00000-000 opcional: quando informado, cada produto
// volta com a distância até o fornecedor que o abastece.
router.get('/produtos', async (req, res) => {

    try {

        const sql = `
            SELECT
                p.*,
                f.nome_fornecedor,
                f.cep_fornecedor,
                f.latitude_fornecedor,
                f.longitude_fornecedor
            FROM produtos p
            LEFT JOIN fornecedores f
                ON p.id_fornecedor = f.id_fornecedor
            ORDER BY p.id_produto
        `;

        const result = await db.query(sql);

        console.log(
            'Produtos encontrados:',
            result.rows.length
        );

        const produtos = await anexarDisponibilidadePorCep(
            result.rows,
            req.query.cep
        );

        res.json(produtos);

    } catch (err) {

        console.error(
            'ERRO AO LISTAR PRODUTOS:',
            err
        );

        res.status(500).json({
            success: false,
            erro: err.message
        });
    }
});


// DISPONIBILIDADE DE UM PRODUTO ESPECÍFICO PARA UM CEP
// GET /api/produtos/:id/disponibilidade?cep=00000-000
router.get('/produtos/:id/disponibilidade', async (req, res) => {

    try {

        const { id } = req.params;
        const { cep } = req.query;

        if (!cep) {
            return res.status(400).json({
                erro: 'Informe o CEP na query string (?cep=00000-000).'
            });
        }

        const sql = `
            SELECT
                p.*,
                f.nome_fornecedor,
                f.cep_fornecedor,
                f.latitude_fornecedor,
                f.longitude_fornecedor
            FROM produtos p
            LEFT JOIN fornecedores f
                ON p.id_fornecedor = f.id_fornecedor
            WHERE p.id_produto = $1
        `;

        const result = await db.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                erro: 'Produto não encontrado'
            });
        }

        const [produto] = await anexarDisponibilidadePorCep(
            result.rows,
            cep
        );

        res.json(produto);

    } catch (err) {

        console.error('Erro ao calcular disponibilidade:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// =====================================================
// DISPONIBILIDADE POR CEP — helpers
// =====================================================

// Recebe as linhas já com os dados do fornecedor (JOIN) e, se um CEP
// de cliente for informado, calcula a distância até o fornecedor de
// cada produto. Geocodifica o CEP do cliente apenas UMA vez por
// request (os fornecedores já ficam geocodificados no cadastro).
async function anexarDisponibilidadePorCep(linhas, cepClienteBruto) {

    if (!cepClienteBruto) {

        return linhas.map(linha => ({
            ...linha,
            disponibilidade: null
        }));

    }

    let cliente = null;

    try {

        cliente = await cepService.buscarCep(cepClienteBruto);

    } catch (err) {

        console.warn(
            'CEP do cliente inválido/indisponível:',
            err.message
        );

        return linhas.map(linha => ({
            ...linha,
            disponibilidade: {
                status: 'erro',
                mensagem: 'Não foi possível localizar esse CEP.'
            }
        }));

    }

    return linhas.map(linha => ({
        ...linha,
        disponibilidade: calcularDisponibilidade(linha, cliente)
    }));

}


function calcularDisponibilidade(produto, clienteEndereco) {

    const temEstoque =
        Number(produto.quantidade_estoque) > 0;

    const fornecedorTemCoordenadas =
        produto.latitude_fornecedor !== null &&
        produto.latitude_fornecedor !== undefined &&
        produto.longitude_fornecedor !== null &&
        produto.longitude_fornecedor !== undefined;

    const clienteTemCoordenadas =
        clienteEndereco.latitude !== null &&
        clienteEndereco.longitude !== null;

    // Caso ideal: dá pra calcular a distância real em km
    if (fornecedorTemCoordenadas && clienteTemCoordenadas) {

        const distanciaKm = cepService.calcularDistanciaKm(
            Number(produto.latitude_fornecedor),
            Number(produto.longitude_fornecedor),
            clienteEndereco.latitude,
            clienteEndereco.longitude
        );

        return {
            status: temEstoque ? 'disponivel' : 'sem_estoque',
            distancia_km: Number(distanciaKm.toFixed(1)),
            loja: produto.nome_fornecedor || null,
            mensagem: temEstoque
                ? `Disponível em ${produto.nome_fornecedor || 'loja parceira'} — ${distanciaKm.toFixed(1)} km do seu CEP`
                : `Sem estoque em ${produto.nome_fornecedor || 'loja parceira'} (${distanciaKm.toFixed(1)} km do seu CEP)`
        };

    }

    // Fallback: sem coordenadas de um dos dois lados, comparamos
    // cidade/UF (funciona mesmo sem nenhuma API paga de geolocalização)
    if (produto.cep_fornecedor) {

        return {
            status: temEstoque ? 'disponivel_sem_distancia' : 'sem_estoque',
            distancia_km: null,
            loja: produto.nome_fornecedor || null,
            mensagem: temEstoque
                ? `Disponível em ${produto.nome_fornecedor || 'loja parceira'} (distância exata indisponível para esse CEP)`
                : `Sem estoque em ${produto.nome_fornecedor || 'loja parceira'}`
        };

    }

    // Fornecedor sem CEP cadastrado ainda
    return {
        status: temEstoque ? 'disponivel_sem_distancia' : 'sem_estoque',
        distancia_km: null,
        loja: produto.nome_fornecedor || null,
        mensagem: temEstoque
            ? 'Produto em estoque (loja de origem sem CEP cadastrado)'
            : 'Sem estoque no momento'
    };

}



// CADASTRAR PRODUTO
router.post('/produtos', async (req, res) => {
    try {

        const {
            nome_produto,
            descricao_produto,
            preco_produto,
            quantidade_estoque,
            id_fornecedor,
            imagem_produto,
            marca_veiculo,
            modelo_veiculo,
            ano_veiculo,
            tipo_veiculo
        } = req.body;

        const sql = `
            INSERT INTO produtos
            (
                nome_produto,
                descricao_produto,
                preco_produto,
                quantidade_estoque,
                id_fornecedor,
                imagem_produto,
                marca_veiculo,
                modelo_veiculo,
                ano_veiculo,
                tipo_veiculo
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const result = await db.query(sql, [
            nome_produto,
            descricao_produto,
            preco_produto,
            quantidade_estoque,
            id_fornecedor,
            imagem_produto || null,
            marca_veiculo || null,
            modelo_veiculo || null,
            ano_veiculo || null,
            tipo_veiculo || null
        ]);

        res.status(201).json(result.rows[0]);

    } catch (err) {

        console.error('Erro ao cadastrar produto:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// =====================================================
// PEDIDOS
// =====================================================

// LISTAR PEDIDOS
router.get('/pedidos', async (req, res) => {
    try {

        const sql = `
            SELECT
                p.*,
                c.nome_cliente
            FROM pedidos p
            LEFT JOIN clientes c
                ON p.id_cliente = c.id_cliente
            ORDER BY p.id_pedido DESC
        `;

        const result = await db.query(sql);

        res.json(result.rows);

    } catch (err) {

        console.error('Erro ao listar pedidos:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// BUSCAR PEDIDO POR ID COM ITENS
router.get('/pedidos/:id', async (req, res) => {
    try {

        const { id } = req.params;

        const pedidoResult = await db.query(`
            SELECT
                p.*,
                c.nome_cliente
            FROM pedidos p
            LEFT JOIN clientes c
                ON p.id_cliente = c.id_cliente
            WHERE p.id_pedido = $1
        `, [id]);

        if (pedidoResult.rows.length === 0) {

            return res.status(404).json({
                erro: 'Pedido não encontrado'
            });

        }

        const itensResult = await db.query(`
            SELECT
                i.*,
                pr.nome_produto
            FROM itens_pedido i
            LEFT JOIN produtos pr
                ON i.id_produto = pr.id_produto
            WHERE i.id_pedido = $1
        `, [id]);

        res.json({
            pedido: pedidoResult.rows[0],
            itens: itensResult.rows
        });

    } catch (err) {

        console.error('Erro ao buscar pedido:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// CRIAR PEDIDO
router.post('/pedidos', async (req, res) => {

    try {

        const {
            id_cliente,
            forma_pagamento
        } = req.body;


        if (!id_cliente) {

            return res.status(400).json({
                erro: 'Cliente é obrigatório'
            });

        }


        if (!forma_pagamento) {

            return res.status(400).json({
                erro: 'Forma de pagamento é obrigatória'
            });

        }


        const clienteResult = await db.query(
            `
                SELECT *
                FROM clientes
                WHERE id_cliente = $1
            `,
            [id_cliente]
        );


        if (
            clienteResult.rows.length === 0
        ) {

            return res.status(404).json({
                erro: 'Cliente não encontrado'
            });

        }


        const sql = `
            INSERT INTO pedidos
            (
                id_cliente,
                data_pedido,
                forma_pagamento,
                status_pedido,
                total_pedido
            )
            VALUES (
                $1,
                NOW(),
                $2,
                'Pendente',
                0
            )
            RETURNING *
        `;


        const result =
            await db.query(
                sql,
                [
                    id_cliente,
                    forma_pagamento
                ]
            );


        res.status(201).json({

            message:
                'Pedido criado com sucesso',

            id_pedido:
                result.rows[0].id_pedido,

            pedido:
                result.rows[0]

        });


    } catch (err) {

        console.error(
            'Erro ao criar pedido:',
            err
        );

        res.status(500).json({

            erro:
                err.message ||
                'Erro ao criar pedido'

        });

    }

});


// =====================================================
// ITENS DO PEDIDO
// =====================================================

// ADICIONAR ITEM AO PEDIDO
router.post('/pedidos/:id/itens', async (req, res) => {

    const client = await db.connect();

    try {

        const { id } = req.params;

        const {
            id_produto,
            quantidade
        } = req.body;


        if (
            !quantidade ||
            Number(quantidade) <= 0
        ) {

            return res.status(400).json({
                erro: 'Quantidade inválida'
            });

        }


        await client.query('BEGIN');


        // Verificar pedido
        const pedidoResult = await client.query(
            'SELECT * FROM pedidos WHERE id_pedido = $1',
            [id]
        );


        if (pedidoResult.rows.length === 0) {

            await client.query('ROLLBACK');

            return res.status(404).json({
                erro: 'Pedido não encontrado'
            });

        }


        if (
            pedidoResult.rows[0].status_pedido ===
            'Cancelado'
        ) {

            await client.query('ROLLBACK');

            return res.status(400).json({
                erro: 'Não é possível alterar um pedido cancelado'
            });

        }


        // Buscar produto
        const produtoResult = await client.query(
            'SELECT * FROM produtos WHERE id_produto = $1',
            [id_produto]
        );


        if (produtoResult.rows.length === 0) {

            await client.query('ROLLBACK');

            return res.status(404).json({
                erro: 'Produto não encontrado'
            });

        }


        const produto = produtoResult.rows[0];


        if (
            Number(produto.quantidade_estoque) <
            Number(quantidade)
        ) {

            await client.query('ROLLBACK');

            return res.status(400).json({
                erro: 'Estoque insuficiente'
            });

        }


        const preco =
            produto.preco_produto;


        // Inserir item
        await client.query(`
            INSERT INTO itens_pedido
            (
                id_pedido,
                id_produto,
                quantidade,
                preco_unitario
            )
            VALUES ($1, $2, $3, $4)
        `, [
            id,
            id_produto,
            quantidade,
            preco
        ]);


        // Baixar estoque
        await client.query(`
            UPDATE produtos
            SET quantidade_estoque =
                quantidade_estoque - $1
            WHERE id_produto = $2
        `, [
            quantidade,
            id_produto
        ]);


        // Atualizar total do pedido
        await client.query(`
            UPDATE pedidos
            SET total_pedido = (
                SELECT COALESCE(
                    SUM(
                        quantidade *
                        preco_unitario
                    ),
                    0
                )
                FROM itens_pedido
                WHERE id_pedido = $1
            )
            WHERE id_pedido = $2
        `, [
            id,
            id
        ]);


        await client.query('COMMIT');


        res.json({
            message: 'Item adicionado com sucesso'
        });


    } catch (err) {

        await client.query('ROLLBACK');

        console.error(
            'Erro ao adicionar item:',
            err
        );

        res.status(500).json({
            erro: err.message ||
                'Erro ao adicionar item'
        });

    } finally {

        client.release();

    }
});


// =====================================================
// ATUALIZAR STATUS DO PEDIDO
// =====================================================

router.patch('/pedidos/:id/status', async (req, res) => {

    try {

        const { id } = req.params;
        const { status } = req.body;


        if (!status) {

            return res.status(400).json({
                erro: 'Status é obrigatório'
            });

        }


        const pedidoResult = await db.query(
            'SELECT * FROM pedidos WHERE id_pedido = $1',
            [id]
        );


        if (pedidoResult.rows.length === 0) {

            return res.status(404).json({
                erro: 'Pedido não encontrado'
            });

        }


        await db.query(`
            UPDATE pedidos
            SET status_pedido = $1
            WHERE id_pedido = $2
        `, [
            status,
            id
        ]);


        res.json({
            message: 'Status atualizado com sucesso'
        });


    } catch (err) {

        console.error(
            'Erro ao atualizar status:',
            err
        );

        res.status(500).json({
            erro: err.message
        });
    }
});


// =====================================================
// CANCELAR PEDIDO
// =====================================================

router.patch('/pedidos/:id/cancelar', async (req, res) => {

    const client = await db.connect();

    try {

        const { id } = req.params;

        await client.query('BEGIN');


        const pedidoResult = await client.query(
            'SELECT * FROM pedidos WHERE id_pedido = $1',
            [id]
        );


        if (pedidoResult.rows.length === 0) {

            await client.query('ROLLBACK');

            return res.status(404).json({
                erro: 'Pedido não encontrado'
            });

        }


        if (
            pedidoResult.rows[0].status_pedido ===
            'Cancelado'
        ) {

            await client.query('ROLLBACK');

            return res.status(400).json({
                erro: 'Pedido já está cancelado'
            });

        }


        // Buscar itens
        const itensResult = await client.query(`
            SELECT *
            FROM itens_pedido
            WHERE id_pedido = $1
        `, [id]);


        // Devolver estoque
        for (
            const item of itensResult.rows
        ) {

            await client.query(`
                UPDATE produtos
                SET quantidade_estoque =
                    quantidade_estoque + $1
                WHERE id_produto = $2
            `, [
                item.quantidade,
                item.id_produto
            ]);

        }


        // Cancelar pedido
        await client.query(`
            UPDATE pedidos
            SET status_pedido = 'Cancelado'
            WHERE id_pedido = $1
        `, [id]);


        await client.query('COMMIT');


        res.json({
            message: 'Pedido cancelado com sucesso'
        });


    } catch (err) {

        await client.query('ROLLBACK');

        console.error(
            'Erro ao cancelar pedido:',
            err
        );

        res.status(500).json({
            erro: err.message
        });

    } finally {

        client.release();

    }
});


// =====================================================
// ITENS DO PEDIDO
// =====================================================

// LISTAR ITENS
router.get('/itens', async (req, res) => {

    try {

        const sql = `
            SELECT
                i.*,
                p.nome_produto
            FROM itens_pedido i
            LEFT JOIN produtos p
                ON i.id_produto = p.id_produto
            ORDER BY i.id_item
        `;

        const result = await db.query(sql);

        res.json(result.rows);

    } catch (err) {

        console.error(
            'Erro ao listar itens:',
            err
        );

        res.status(500).json({
            erro: err.message
        });
    }
});


// CADASTRO DIRETO DE ITEM
router.post('/itens', async (req, res) => {

    try {

        const {
            id_pedido,
            id_produto,
            quantidade,
            preco_unitario
        } = req.body;


        const sql = `
            INSERT INTO itens_pedido
            (
                id_pedido,
                id_produto,
                quantidade,
                preco_unitario
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;


        const result = await db.query(sql, [
            id_pedido,
            id_produto,
            quantidade,
            preco_unitario
        ]);


        res.status(201).json(
            result.rows[0]
        );


    } catch (err) {

        console.error(
            'Erro ao cadastrar item:',
            err
        );

        res.status(500).json({
            erro: err.message
        });
    }
});


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;

