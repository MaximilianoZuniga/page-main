const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware para parsear JSON y habilitar CORS
app.use(express.json());
// Usamos CORS para permitir que tus archivos HTML accedan al API
app.use(cors());

// Servir archivos estáticos (HTML, CSS, JS, imagenes) desde la carpeta actual
app.use(express.static(__dirname));

// --- Rutas API para los Regalos ---

// GET: Obtener todos los regalos
app.get('/api/gifts', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading data file');
    }
    res.json(JSON.parse(data));
  });
});

// POST: Añadir un nuevo regalo
app.post('/api/gifts', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading data file');
    }
    const gifts = JSON.parse(data);
    const newGift = req.body;
    gifts.push(newGift);

    fs.writeFile(DATA_FILE, JSON.stringify(gifts, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error writing data file');
      }
      res.status(201).json(newGift);
    });
  });
});

// PUT: Actualizar un regalo (ej. marcar como reservado)
app.put('/api/gifts/:id', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading data file');
    }
    let gifts = JSON.parse(data);
    const giftId = parseInt(req.params.id);
    const giftIndex = gifts.findIndex(g => g.id === giftId);

    if (giftIndex === -1) {
      return res.status(404).send('Gift not found');
    }
    
    // Lógica para verificar si ya está reservado y enviar el mensaje específico
    if (req.body.reserved && gifts[giftIndex].reserved) {
        return res.status(409).send('Regalo ya reservado por otra persona :P'); // Código 409 Conflict
    }

    // Actualiza solo la propiedad 'reserved'
    gifts[giftIndex].reserved = req.body.reserved;

    fs.writeFile(DATA_FILE, JSON.stringify(gifts, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error writing data file');
      }
      res.status(200).json(gifts[giftIndex]);
    });
  });
});

// DELETE: Eliminar un regalo
app.delete('/api/gifts/:id', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data file');
        }
        let gifts = JSON.parse(data);
        const giftId = parseInt(req.params.id);
        const initialLength = gifts.length;

        gifts = gifts.filter(g => g.id !== giftId);

        if (gifts.length === initialLength) {
            return res.status(404).send('Gift not found');
        }

        fs.writeFile(DATA_FILE, JSON.stringify(gifts, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing data file');
            }
            res.status(204).send(); // 204 No Content
        });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js escuchando en http://localhost:${PORT}`);
  console.log(`Visita la lista de usuarios en http://localhost:${PORT}/user.html`);
  console.log(`Visita el panel de admin en http://localhost:${PORT}/admin.html`);
});
