// Código do cliente (frontend)
const formulario = document.getElementById('artForm');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(formulario);
    const dadosFormulario = {
        style: formData.get('style'),
        quantity: formData.get('quantity'),
        size: formData.get('size'),
        delivery: formData.get('delivery'),
        colors: formData.get('colors'),
        format: formData.get('format'),
        opinion: formData.get('opinion'),
        email: formData.get('email')
    };

    try {
        const response = await fetch('/.netlify/functions/server/pedidos', { // Caminho corrigido para Netlify Functions
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosFormulario)
        });

        if (response.ok) {
            alert('Pedido enviado com sucesso!');
            window.location.href = '/pedidos.html';
        } else {
            const error = await response.json();
            alert('Erro ao enviar pedido: ' + error.erro); // Chave corrigida para match com o backend
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar pedido');
    }
});

// ==============================================
// Código do servidor (deveria estar em arquivo separado)
// Nota: Esta parte não deve estar no mesmo arquivo que o código do cliente!
// Sugerido mover para netlify/functions/server.js

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const router = express.Router();

// Conexão com MongoDB usando variável de ambiente
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
router.post('/pedidos', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("art-pedidos");
        await db.collection("pedidos").insertOne(req.body);
        res.status(201).json({ mensagem: 'Pedido recebido com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar pedido:', error);
        res.status(500).json({ erro: 'Erro ao processar pedido' });
    } finally {
        await client.close();
    }
});

router.get('/pedidos', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("art-pedidos");
        const pedidos = await db.collection("pedidos").find({}).toArray();
        res.json(pedidos);
    } catch (error) {
        console.error('Erro ao ler pedidos:', error);
        res.status(500).json({ erro: 'Erro ao ler pedidos' });
    } finally {
        await client.close();
    }
});

app.use('/.netlify/functions/server', router);
module.exports.handler = app;