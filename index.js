const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db');
const User = require('./model/User')
const jwt = require('jsonwebtoken');
const uuid = require('uuid')

require('dotenv').config();

const app = express();
const jwtSecretKey = process.env.JWT_SECRET_KEY;

app.use(cors());
app.use(bodyParser.json());


function authenticateToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) return res.sendStatus(401);

    jwt.verify(token, jwtSecretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}


app.post('/api/register', async (req, res) => {
    const { name, surname, mail, password } = req.body
    const user = new User({ name: name, surname: surname, mail: mail, password: password })
    let stat = await user.Register()
    res.status(stat.code).json({ message: stat.message, status: stat.code })
})

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body
    const user = new User()
    let stat = await user.Login(username, password)
    res.status(stat.code).json({ message: stat.message, status: stat.code })
})

app.get('/api/test', authenticateToken, (req, res) => {
    try {
        const { data } = req.body;

        // const query = 'INSERT INTO your_table_name (data_column_name) VALUES ($1) RETURNING *';
        const query = 'select * from users'
        // const values = [data];
        pool.query(query, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200).json(result.rows)
            }
        });

        // res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

const port = 4575;
app.listen(port, () => {
    console.log(`Sunucu ${port} numaralı bağlantı noktasında dinleniyor.`);
});