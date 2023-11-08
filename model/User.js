const pool = require('../db')
const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const uuid = require('uuid')


class User {
    id = ''
    name = ''
    surname = ''
    mail = ''
    password = ''

    constructor(obj) {
        if (obj) {
            this.id = uuid.v4()
            this.name = obj.name
            this.surname = obj.surname
            this.mail = obj.mail
            this.password = obj.password
        }
    }
    Login(username, password) {
        const query = 'select * from users where mail=$1 AND password=$2';
        return pool.query(query, [username, password])
            .then(result => {
                const res = result.rows;
                if (res.length === 0) {
                    return { code: 422, message: 'Kullanıcı adı veya şifre bulunamadı' };
                } else {
                    const user = res[0];
                    const token = jwt.sign({ id: user.id, name: user.name, surname: user.surname, mail: user.mail }, jwtSecretKey, { expiresIn: '24h' });
                    return { code: 200, message: token };
                }
            })
            .catch(err => {
                console.log(err);
                return { code: 422, message: 'Kullanıcı adı veya şifre bulunamadı' };
            });
    }
    Register() {
        const query = 'insert into users (id, name, surname, mail, password) VALUES($1,$2,$3,$4,$5)'
        return pool.query(query, [this.id, this.name, this.surname, this.mail, this.password])
            .then(result => {
                const res = result.rows
                const token = jwt.sign({ id: this.id, name: this.name, surname: this.surname, mail: this.mail }, jwtSecretKey, { expiresIn: '24h' });
                return { code: 200, message: token }

            })
    }
}

module.exports = User;