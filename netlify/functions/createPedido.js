const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'art-pedidos';

// Conexão persistente
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10
    });
    
    const db = client.db(DB_NAME);
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
}

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        const { client, db } = await connectToDatabase();
        const pedido = JSON.parse(event.body);
        pedido.data = new Date().toISOString();
        
        const result = await db.collection('pedidos').insertOne(pedido);
        
        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Pedido criado com sucesso',
                id: result.insertedId
            })
        };
    } catch (error) {
        console.error('Erro no servidor:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Erro ao criar pedido',
                details: process.env.NODE_ENV === 'development' ? error.message : null
            })
        };
    }
};