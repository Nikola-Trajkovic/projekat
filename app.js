const express = require("express");
const path = require("path");
const { sequelize } = require('./models');
const jwt = require('jsonwebtoken');
let alert = require('alert'); 
require('dotenv').config();

var userType;

const app = express();

function getCookies(req) {
    if (req.headers.cookie == null) return {};

    const rawCookies = req.headers.cookie.split('; ');
    const parsedCookies = {};

    rawCookies.forEach( rawCookie => {
        const parsedCookie = rawCookie.split('=');
        parsedCookies[parsedCookie[0]] = parsedCookie[1];
    });

    return parsedCookies;
};

function authToken(req, res, next) {
    const cookies = getCookies(req);
    const token = cookies['token'];
  
    if (token == null) return res.redirect(307, '/admin/login');
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    
        if (err) return res.redirect(307, '/admin/login');
    
        req.user = user;
        userType = user.type;
    
        next();
    });
}

function validacija(req, res, next) {
    const cookies = getCookies(req);
    const token = cookies['token'];
  
    if (token == null) return res.redirect(307, '/admin/login');
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    
        if (err) return res.redirect(307, '/admin/login');
    
        req.user = user;

        if(req.user.type != "admin"){
            return res.redirect(307, '/admin/index');
        }
       
    
        next();
    });
}

function userCheck(req, res, next) {
    const cookies = getCookies(req);
    const token = cookies['token'];
  
    if (token == null) return res.redirect(307, '/admin/login');
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    
        if (err) return res.redirect(307, '/admin/login');
    
        req.user = user;

        if(req.user.type == "user"){
            alert("Nemate pristup admin panelu!");
            return res.redirect(307, '/admin/login');
        }
       
    
        next();
    });
}





app.get('/admin/login', (req, res) => {
    res.sendFile('login.html', { root: './static/admin' });
});

app.get('/admin/register', (req, res) => {
    res.sendFile('register.html', { root: './static/admin' });
});

app.get('/admin/index', [authToken , userCheck] ,(req, res) => {
    res.sendFile('index.html', { root: './static/admin' });
});

app.get('/admin/', [authToken , userCheck] ,(req, res) => {
    res.sendFile('index.html', { root: './static/admin' });
});

app.get('/admin/auto', authToken, (req,res) => { 
    res.sendFile('auto.html', {root: './static/admin'});
});

app.get('/admin/motor', authToken, (req,res) => {
    res.sendFile('motor.html', {root: './static/admin'});
});

app.get('/admin/oglas_auto', authToken, (req,res) => {
    res.sendFile('oglas_auto.html', {root: './static/admin'});
});

app.get('/admin/oglas_motor', authToken, (req,res) => {
    res.sendFile('oglas_motor.html', {root: './static/admin'});
});

app.get('/admin/users',[ authToken, validacija ], (req,res) => {
    
    res.sendFile('users.html', {root: './static/admin'});

});

app.get('/admin/users.html',[ authToken, validacija ], (req,res) => {
    
    res.sendFile('users.html', {root: './static/admin'});

});

app.use(express.static(path.join(__dirname, 'static')));

app.listen({ port: 8000 }, async () => {
    await sequelize.authenticate();
    console.log("app started");
});