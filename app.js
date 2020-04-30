require('dotenv-safe').config()
const http = require('http')
const express = require('express')
const expressHttpProxy = require('express-http-proxy')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const logger = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

var dbConfig = require('./db');
var mongoose = require('mongoose');
var useUnifiedTopology = { useUnifiedTopology: true, useNewUrlParser: true }
mongoose.connect(dbConfig.url, useUnifiedTopology);
var User = require('./models/user');

const app = express()

// var customersServiceProxy = httpProxy('http://localhost:3001')
// var usersServiceProxy = httpProxy('http://localhost:3001')
// var productsServiceProxy = httpProxy('http://localhost:3001')

var apiServiceProxy = expressHttpProxy('http://localhost:3001')

const port = process.env.PORT || 3000

// app.use(function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*')
//     res.header('Access-Control-Allow-Headers', '*')
//     res.header('Access-Control-Allow-Credentials', '*')
//     res.header('Access-Control-Expose-Headers', 'Authorization')
//     next()
// })

app.use(logger('dev'))
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

const corsOptions = {
    exposedHeaders: 'Authorization'
}

app.use(cors(corsOptions));

function log(message) {
    var data = new Date()
    console.log('****************************************')
    console.log(data.toLocaleDateString() + ' ' + data.toLocaleTimeString() + ' - ' + message)
    // console.log('****************************************')
}

app.get('/user', verifyJWT, (req, res, next) => {
//    let id = req.query.id
//   console.log('\nID: ' + id + '\n')
    log('get/user...')
    apiServiceProxy(req, res, next)
})

app.get('/customers', verifyJWT, (req, res, next) => {
    log('get/customers...')
    apiServiceProxy(req, res, next)
})

app.get('/users', verifyJWT, (req, res, next) => {
    log('get/users...')
    apiServiceProxy(req, res, next)
})

app.get('/cart/:id', (req, res, next) => {
    log('get/cart/:id...')
    apiServiceProxy(req, res, next)
})

app.get('/cart/search/:search', (req, res, next) => {
    log('get/cart/search/:search...')
    apiServiceProxy(req, res, next)
})

app.get('/cart/last', (req, res, next) => {
    log('get/cart/last...')
    apiServiceProxy(req, res, next)
})

app.post('/cart', (req, res, next) => {
    log('post/cart...')
    apiServiceProxy(req, res, next)
})

app.put('/cart/:id', (req, res, next) => {
    log('put/cart...')
    apiServiceProxy(req, res, next)
})

app.patch('/cart/set/:id', (req, res, next) => {
    log('patch/cart/set/:id...')
    apiServiceProxy(req, res, next)
})

app.patch('/cart/push/:id', (req, res, next) => {
    log('patch/cart/push/:id...')
    apiServiceProxy(req, res, next)
})

app.patch('/cart/pull/:id', (req, res, next) => {
    log('patch/cart/pull/:id...')
    apiServiceProxy(req, res, next)
})

app.get('/products', (req, res, next) => {
    log('get/products...')
    apiServiceProxy(req, res, next)
})

app.get('/products/:id', (req, res, next) => {
    log('get/products/:id...')
    apiServiceProxy(req, res, next)
})

app.get('/product/:search', (req, res, next) => {
    log('get/product/:search...')
    apiServiceProxy(req, res, next)
})

app.post('/products', verifyJWT, (req, res, next) => {
    log('post/products...')
    apiServiceProxy(req, res, next)
})

app.get('/images', verifyJWT, (req, res, next) => {
    log('get/images...')
    apiServiceProxy(req, res, next)
})

app.get('/images/last', verifyJWT, (req, res, next) => {
    log('get/images/last...')
    apiServiceProxy(req, res, next)
})

app.post('/images', verifyJWT, (req, res, next) => {
    log('post/images...')
    apiServiceProxy(req, res, next)
})

app.post('/login', (req, res, next) => {
    log('post/login...')
    User.findOne({ _id: req.body.id, email: req.body.email }, (err, doc) => {
        if (err)
            return res.status(500).json({
                auth: false,
                message: 'Falha ao fazer login!',
                token: null
            })
        if (doc != null) {
            let id = doc._id
            let token = jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: 30 * 60 })
            return res.status(200).json({
                auth: true,
                message: 'Login OK!',
                token: token
            })
        }
        return res.status(500).json({
            auth: false,
            message: 'Login inválido!',
            token: null
        })
    })
})

app.get('/session-id', (req, res, next) => {
    log('get/session-id...')
	let id = '1rwbeKKw1'
	let token = jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: 3600 })
	return res.status(200).json({
		token: token
	})
})

app.get('/logout', function (req, res) {
    log('get/logout...')
    res.status(200).json({
        auth: false,
        message: 'Logout OK',
        token: null
    })
})

app.get('/check', verifyJWT, (req, res, next) => {
    log('get/check...')
    res.status(200).json({
        auth: true,
        message: 'Check OK'
    })
})

function verifyJWT(req, res, next) {
    log('verifyJWT...')
    let token = req.query.token || req.body.token || req.headers['x-access-token']
    if (!token) return res.status(401).json({
        auth: false,
        message: 'Token não informado!',
        token: null
    })
    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
        if (err)
            return res.status(500).json({
                auth: false,
                message: 'Token inválido!',
                token: null
            })
        // console.log('DECODED ID: ' + decoded.id)
        next()
    })
}

var server = http.createServer(app)
server.listen(3000, () => {
    console.log('API => Status: OK... DB: OK... Port: %s... Environment: %s...', port, process.env.NODE_ENV);
})