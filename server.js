const express = require('express');

const app = express();
const PORT = 3000;
app.use(express.json());

// Datos de prueba en memoria (sin base de datos)
const products = [
    {id: 1, name: "Camiseta básica", price: 15.5, stock: 40, category: "ropa"},
    {id: 2, name: "Taza de cerámica", price: 6.9, stock: 120, category: "hogar"}
];

//Endpoint - Get
app.get('/products', (req, res) => {
    res.json(products);
});

//Endpoint - Post
app.post('/products', (req, res) => {
    // En Express 5 req.body es undefined cuando la petición no trae cuerpo
    const {name, price, stock, category} = req.body || {};

    // 1) name y price son obligatorios
    const nameMissing = typeof name !== 'string' || name.trim() === '';
    const priceMissing = price === undefined || price === null || price === '';
    if (nameMissing || priceMissing) {
        return res.status(400).json({error: 'El nombre y el precio son obligatorios'});
    }

    // 2) price debe ser un número mayor que 0 (un texto como "10" tampoco es válido)
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
        return res.status(400).json({error: 'El precio debe ser un número mayor que 0'});
    }

    //Nuevo objeto para el arreglo (el id sigue al mayor id existente)
    const nextId = Math.max(0, ...products.map((product) => product.id)) + 1;
    const newProduct = {
        id: nextId,
        name: name.trim(),
        price,
        stock: stock ?? 0,
        category: category ?? 'general'
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Si el JSON enviado está mal formado, responde 400 en JSON (no en HTML)
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({error: 'El cuerpo de la petición no es un JSON válido'});
    }
    next(err);
});

//Enciende el servidor
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
}

module.exports = app;
