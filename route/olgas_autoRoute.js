const express = require('express');
const { sequelize, Users, Messages,Oglas_autos } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
require('dotenv').config();

const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({ extended: true }));

function authToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.status(401).json({ msg: err });
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    
        if (err) return res.status(403).json({ msg: err });
    
        req.user = user;
    
        next();
    });
}

route.use(authToken);

route.get('/oglas_auto', (req, res) => {
    Oglas_autos.findAll({ include: ['user']})
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});

route.post('/oglas_auto', (req, res) => {

    console.log("Usao u rest");

    var validirano = true;
    var error;

    const sema = Joi.object().keys({

        opis: Joi.string().required(),
        likes: Joi.number().required(),
        dislikes: Joi.number().required(),
        contact: Joi.string().required(),
        cena: Joi.number().required(),
        userId: Joi.number().required(),
        autoId: Joi.number().required(),


    })
    
    const obj = {
        opis: req.body.opis,
        likes: req.body.likes,
        dislikes: req.body.dislikes,
        contact: req.body.contact,
        cena: req.body.cena,
        userId: req.user.userId,
        autoId: req.body.autoID
    };

    Joi.validate(obj, sema, (err, result) => {

        if(err){
            error = err.message;
            console.log("ERROR " + err.message);
            //res.send(err.details[0].message);
            validirano = false;
        }

    });


    if(validirano){
        Oglas_autos.create(obj)
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
    }else{
        res.json({error: error});
    }
           
    
        
        
});

route.delete('/oglas_auto', (req,res) => {


    Oglas_autos.findOne({ where: { id: req.body.id } })
        .then( usr => {
            usr.destroy()
                .then( rows => res.json(rows) )
                .catch( err =>{console.log("USAO U OVAJ ERROR"); res.status(500).json({msg:err})}  );
        })
        .catch( err => res.status(500).json(err) );

});

route.put('/oglas_auto', (req, res) => {

    Oglas_autos.findOne({ where: { id: req.body.id }})
        .then( usr => {

            var validirano = true;
            var error;

            const obj = {

                opis : req.body.opis,
                likes : req.body.likes,
                dislikes : req.body.dislikes,
                contact : req.body.contact,
                cena : req.body.cena

            }

            const sema = Joi.object().keys({

                opis: Joi.string().required(),
                likes: Joi.number().required(),
                dislikes: Joi.number().required(),
                contact: Joi.string().required(),
                cena: Joi.number().required(),
               
        
        
            })

            Joi.validate(obj, sema, (err, result) => {

                if(err){
                    error = err.message;
                    console.log("ERROR " + err.message);
                    //res.send(err.details[0].message);
                    validirano = false;
                }
        
            });

            if(validirano){

                usr.opis = obj.opis;
                usr.likes = obj.likes;
                usr.dislikes = obj.dislikes;
                usr.contact = obj.contact;
                usr.cena = obj.cena;


                usr.save()
                    .then( rows => res.json(rows) )
                    .catch( err => res.status(500).json(err) );

            }else{
                res.json({error: error});
            }

            
        })
        .catch( err => res.status(500).json(err) );

});



module.exports = route;