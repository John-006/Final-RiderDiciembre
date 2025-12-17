const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
const app = express();

app.use(express.json()); 
app.use(cors()); 

// 1. Configurar para servir archivos estáticos desde 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 2. Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/mi_base_datos')
    .then(() => console.log('Conectado a Mongo!'))
    .catch(err => console.error('Error de conexión a Mongo:', err));

// 3. Modelo Genérico (Schema)
const ItemSchema = new mongoose.Schema({ any: mongoose.Schema.Types.Mixed }, { strict: false });
const Item = mongoose.model('Item', ItemSchema);

// --- ENDPOINTS DE LA API (CRUD) ---

// READ (GET)
app.get('/api/datos', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        res.status(500).send('Error al obtener datos');
    }
});

// CREATE (POST)
app.post('/api/datos', async (req, res) => {
    try {
        const nuevoItem = new Item(req.body);
        await nuevoItem.save();
        res.status(201).json(nuevoItem);
    } catch (error) {
        res.status(500).send('Error al crear el item.');
    }
});

// UPDATE (PUT) - Maneja Edición Anidada
app.put('/api/datos/:id', async (req, res) => {
    const { id } = req.params;
    const { clave, valor } = req.body; // clave puede ser 'address.street'
    
    try {
        // Usamos $set con la clave dinámica (puede ser anidada)
        await Item.findByIdAndUpdate(id, { $set: { [clave]: valor } });
        res.json({ mensaje: 'Actualizado' });
    } catch (error) {
        res.status(500).send('Error al actualizar el item');
    }
});

// DELETE (DELETE) - ¡NUEVO!
app.delete('/api/datos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Item.findByIdAndDelete(id);
        res.json({ mensaje: 'Eliminado' });
    } catch (error) {
        res.status(500).send('Error al eliminar el item');
    }
});

app.listen(3000, () => console.log('Servidor en puerto 3000... dirijase a localhost:3000 en su navegador para continuar.'));