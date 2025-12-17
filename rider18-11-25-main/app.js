const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch').default;

const DbService = require('./services/dbService');
const dbInit = require('./services/dbInit');

const app = express();

(async () => {
  try {
    // ⬅️ ESPERAMOS a que BD y tabla existan
    await dbInit();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static('public'));

    // INSERT
    app.post('/insert', async (req, res) => {
      const { name, price, stock } = req.body;
      const db = new DbService();

      try {
        const id = await db.insertNewName(name, price, stock);
        res.json({ success: true, id });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    });

    // GET ALL
    app.get('/getAll', async (req, res) => {
      const db = new DbService();
      const data = await db.getAllData();
      res.json({ data });
    });

    // UPDATE
    app.patch('/update', async (req, res) => {
      const { id, name, price, stock } = req.body;
      const db = new DbService();

      try {
        const ok = await db.updateNameById(id, name, price, stock);
        res.json({ success: ok });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    });

    // DELETE
    app.delete('/delete/:id', async (req, res) => {
      const { id } = req.params;
      const db = new DbService();

      try {
        const ok = await db.deleteRowById(id);
        res.json({ success: ok });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    });

    // IMPORT JSON
    app.post('/import-json', async (req, res) => {
      const { url } = req.body;
      const db = new DbService();

      if (!url) {
        return res.status(400).json({ success: false, message: 'URL es requerida' });
      }

      try {
        const fetchResponse = await fetch(url);
        const products = await fetchResponse.json();

        if (!Array.isArray(products)) {
          return res.status(400).json({ success: false, message: 'JSON inválido' });
        }

        let count = 0;
        for (const p of products) {
          if (p.name && p.price && p.stock) {
            await db.insertNewName(p.name, p.price, p.stock);
            count++;
          }
        }

        res.json({ success: true, inserted: count });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    });

    app.listen(3000, () =>
      console.log('Servidor corriendo en el puerto 3000')
    );

  } catch (fatalError) {
    console.error("El servidor no pudo iniciar:", fatalError.message);
    process.exit(1);
  }
})();
