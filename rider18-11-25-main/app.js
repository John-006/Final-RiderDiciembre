const express = require('express');
const app = express();
const cors = require('cors');
const DbService = require('./services/dbService');
const fetch = require('node-fetch').default; // Necesario para la importación JSON

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public')); // Carga el HTML/CSS/JS

// RUTAS API
// Insertar (CREATE)
app.post('/insert', (request, response) => {
    const { name, price, stock } = request.body;
    const db = new DbService();
    db.insertNewName(name, price, stock)
    .then(data => response.json({ data: data }))
    .catch(err => console.log(err));
});

// Leer (READ)
app.get('/getAll', (request, response) => {
    const db = new DbService();
    db.getAllData()
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
});

// Actualizar (UPDATE)
app.patch('/update', (request, response) => {
    const { id, name, price, stock } = request.body;
    const db = new DbService();
    db.updateNameById(id, name, price, stock)
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

// Eliminar (DELETE)
app.delete('/delete/:id', (request, response) => {
    const { id } = request.params;
    const db = new DbService();
    db.deleteRowById(id)
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

// NUEVA RUTA: Importar JSON desde una URL
app.post('/import-json', async (request, response) => {
    const { url } = request.body;
    const db = new DbService();

    if (!url) {
        return response.status(400).json({ success: false, message: 'URL es requerida.' });
    }

    try {
        const fetchResponse = await fetch(url);
        if (!fetchResponse.ok) {
            throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }
        const products = await fetchResponse.json();

        if (!Array.isArray(products)) {
            return response.status(400).json({ success: false, message: 'La URL no devolvió un arreglo de productos.' });
        }

        let insertedCount = 0;
        
        for (const product of products) {
            if (product.name && product.price && product.stock) {
                await db.insertNewName(product.name, product.price, product.stock);
                insertedCount++;
            }
        }

        response.json({ 
            success: true, 
            message: `Importación exitosa. Se insertaron ${insertedCount} productos.` 
        });

    } catch (error) {
        console.error("Error al importar JSON:", error.message);
        response.status(500).json({ success: false, message: 'Error en la importación: ' + error.message });
    }
});


app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));