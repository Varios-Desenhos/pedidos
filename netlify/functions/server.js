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

// Cache de conexão para reutilização
let database = null;

async function connectToDatabase() {
    if (database) return database;
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
    }
    database = client.db("art-pedidos");
    return database;
}

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
router.post('/pedidos', async (req, res) => {
    try {
        const db = await connectToDatabase();
        await db.collection("pedidos").insertOne(req.body);
        res.status(201).json({ 
            sucesso: true,
            mensagem: 'Pedido salvo no banco de dados com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao salvar pedido:', error);
        res.status(500).json({ erro: 'Erro ao processar pedido' });
    } finally {
        await client.close();
    }
});

router.get('/pedidos', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const pedidos = await db.collection("pedidos")
            .find({})
            .sort({ _id: -1 })
            .toArray();
            
        res.status(200).json({
            sucesso: true,
            dados: pedidos
        });
    } catch (error) {
        console.error('Erro no GET:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Falha ao buscar pedidos no banco de dados'
        });
    }
});

// Handler universal para erros de conexão
app.use((err, req, res, next) => {
    console.error('Erro de conexão com o MongoDB:', err);
    res.status(400).json({
        sucesso: false,
        erro: 'Servidor indisponível. Tente novamente mais tarde.'
    });
});

app.use('/.netlify/functions/server', router);
module.exports.handler = app;