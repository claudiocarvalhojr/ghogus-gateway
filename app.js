//index.js
require('dotenv-safe').config()
var http = require('http')
const express = require('express')
const httpProxy = require('express-http-proxy')
const app = express()
var cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
var jwt = require('jsonwebtoken')
var logger = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const userServiceProxy = httpProxy('http://localhost:3001')

const port = process.env.PORT || 3000

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Credentials', '*')
    res.header('Access-Control-Expose-Headers', 'x-access-token')
    next()
})

app.use(logger('dev'))
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
// app.use(cors());
const corsOptions = {
    exposedHeaders: 'Authorization'
}
  
app.use(cors(corsOptions));

//rota protegida
app.get('/clientes', verifyJWT, (req, res, next) => {
    console.log('server/clientes...')
    // console.log('Retornou todos clientes!')
    // res.status(200).json([{id:1, nome:'claudio'}])
    userServiceProxy(req, res, next)
})

//rota de login
app.post('/login', (req, res, next) => {

    console.log('server/login...')
    // console.log('user: ', req.body.user)
    // console.log('pass: ', req.body.pass)

    let user = req.body.user
    let pass = req.body.pass

    if (user === 'claudio' && pass === '123') {
        const id = 1
        var token = jwt.sign({ id }, process.env.SECRET, { expiresIn: 30 })
        console.log('Fez login e gerou token!')
        return res.status(200).json({ 
            user: req.body.user, 
            auth: true, 
            message: 'Login OK',
            token: token
        })
    }
    console.log('Login falhou!')
    return res.status(500).json({ 
        auth: false, 
        message: 'Login inválido!',
        token: null
    })
})

//rota de logout
app.post('/logout', function (req, res) {
    console.log('Fez logout e cancelou o token!')
    res.status(200).json({ 
        auth: false, 
        message: 'Logout OK',
        token: null 
    })
})

app.get('/check', verifyJWT, (req, res, next) => {
    console.log('server/check...')
    res.status(200).json({
        auth: true, 
        message: 'Check OK'
    })
})

//função que verifica se o JWT é ok
function verifyJWT(req, res, next) {

    console.log('\nserver/verifyJWT...')

    // console.log('Headers 1: ' + JSON.stringify(res.getHeadernames()))
    // console.log('Headers 2: ' + JSON.stringify(res.getHeaders()))

    // console.log(JSON.stringify(req.headers));

    // let token = req.query.token || req.headers['x-access-token']
    let token = req.body.token || req.query.token || req.headers['x-access-token']
    
    // console.log('x-access-token: ' + res.hasHeader('x-access-token'))

    // console.log('Token: ' + token)

    if (!token) return res.status(401).json({ 
        auth: false, 
        message: 'Token não informado.',
        token: null
    })
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) return res.status(500).json({ 
            auth: false, 
            message: 'Token inválido.',
            token: null
        })
        // req.userId = decoded.id
        // console.log('User Id: ' + decoded.id)
        next()
    })
}

var server = http.createServer(app)
server.listen(3000, () => {
    console.log('API => Status: OK... DB: OK... Port: %s... Environment: %s...', port, process.env.NODE_ENV);
})