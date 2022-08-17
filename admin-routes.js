const { getAuth, idToken } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue, collection, onSnapshot } = require('firebase-admin/firestore');
const express = require('express');
const { json } = require('body-parser');
const router = express.Router();
const db = getFirestore();

module.exports = function (app) {

    const listeners = require('./listeners.js');

    let admins = listeners.admins;
    let companies = listeners.companies;
    let users = listeners.users;
    let prices = listeners.prices;
    let meals = listeners.meals;

    // Validate Admin
    app.use('/admin', router);
    router.use(function (req, res, next) {
        getAuth().verifyIdToken(req.body.token).then((decodedToken) => {
            let index = admins.findIndex(admin => admin.uid.toString() === decodedToken.uid);
            if (index > -1 && admins[index].type === 'NIRSA') {
                res.locals.admin = admins[index];
                next();
            } else {
                res.send({
                    status: 'Not admin'
                });
            }
        }).catch((error) => {
            res.send(error)
        })
    });

    // MEALS 

    router.post('/meals', (req, res) => {
        res.send(meals.filter(meal => meal.date.toDate().toDateString() === new Date().toDateString()));
    })

    router.post('/periodmeals', (req, res) => {
        res.send(meals);
    })

    // COMPANIES
    router.post('/companies', (req, res) => {
        res.send(companies);
    })

    router.post('/addCompany', (req, res) => {
        const data = {
            name: req.body.company,
        }
        db.collection('companies').doc(req.body.company).set(data);
        res.send('success');
    })

    router.post('/deleteCompany', (req, res) => {
        db.collection('companies').doc(req.body.company).delete();
        res.send('success');
    })

    // ADMINS
    router.post('/login', (req, res) => {
        res.send({
            admin: res.locals.admin,
            status: 'success'
        });
    });

    router.post('/admins', (req, res) => {
        res.send(admins);
    })

    router.post('/deleteAdmin', (req, res) => {
        getAuth().deleteUser(req.body.uid).then(() => {
            db.collection('admins').doc(req.body.uid).delete().then(() => {
                res.send({
                    status: 'success',
                    admins: admins
                });
            })
        }).catch((error) => {
            res.send({
                status: 'error',
                error: error
            });
        });
    })

    router.post('/createAdmin', (req, res) => {
        var val = Math.floor(1000 + Math.random() * 9000);
        let admin;
        let found = true;
        while (found) {
            admins.findIndex(admin => admin.uid === val);
            if (admins.findIndex(admin => admin.uid === val) === -1) {
                found = false;
            } else {
                val = Math.floor(1000 + Math.random() * 9000);
            }
        }
        admin = JSON.parse(req.body.admin);
        console.log(admin);
        getAuth().createUser({
            uid: '23646-' + val.toString(),
            email: admin.email,
            password: '123456',
            displayName: admin.name + ' ' + admin.lastname,
            disabled: false,
            emailVerified: false
        }).then((userRecord) => {
            console.log('Successfully created new user:', userRecord.uid);
            const data = {
                name: admin.name,
                lastname: admin.lastname,
                email: admin.email,
                type: admin.type,
                active: admin.active,
                uid: '23646-' + val.toString(),
            }
            console.log(data);
            db.collection('admins').doc(val.toString()).set(data).then(() => {
                console.log('created admin db');
                res.send({
                    status: 'success'
                });
            }).catch((error) => {
                console.log(error)
                res.send({
                    status: 'error',
                    error: error
                })
            })
        }).catch((error) => {
            console.log('Error creating new user:', error);
            res.send({
                status: 'error',
                error: error
            });
        })
    })

    // COLABORADORES

    router.post('/colaboradores', (req, res) => {
        res.send(users);
    })

    router.post('/deletecolaborador', (req, res) => {
        db.collection('colaboradores').doc(req.body.id).delete().then(() => {
            getAuth().deleteUser(req.body.id).then(() => {
                let mealstodelete = meals.filter(meal => meal.user === req.body.id);
                mealstodelete.forEach(meal => {
                    let today = new Date().getTime();
                    let mealDate = new Date(meal.date._seconds * 1000).getTime();
                    if(mealDate > today){
                        db.collection('meals').doc(meal.id).delete();
                        console.log('deleted meal', new Date(meal.date._seconds * 1000).toLocaleDateString());
                    }
                })
                res.send('success');
            }).catch((error) => {
                res.send('Error al eliminar el colaborador');
            })
        }).catch(error => {
            res.send('Error al eliminar el colaborador')
        })
    })

    router.post('/editcolaborador', (req, res) => {
        let active = req.body.active === 'true' ? true : false;
        db.collection('colaboradores').doc(req.body.id).update({
            active: active,
            company: req.body.company,
        }).then(() => {
            res.send('success');
        }).catch(error => {
            res.send('Error al editar el colaborador')
        })
    })

    router.post('/createcolaborador', (req, res) => {
        let data = JSON.parse(req.body.user);
        let index = users.findIndex(user => user.id === data.id);
        if (index > -1) {
            res.send({
                status: 'error',
                data: 'Ya existe un colaborador con el mismo numero de identificacion'
            });
            return;
        }
        getAuth().createUser({
            uid: data.id,
            email: data.email,
            password: '123456',
            displayName: data.name + ' ' + data.lastname,
            disabled: false,
            emailVerified: false
        }).then((userRecord) => {
            db.collection('colaboradores').doc(data.id).set(data).then(() => {
                res.send({
                    status: 'success'
                });
            }).catch(error => {
                // create user db error
                res.send({
                    status: 'error',
                    data: 'El correo electronico ya existe'
                });
            })
        }).catch((error) => {
            res.send({
                // create user error
                status: 'error',
                data: error
            });
        })
    })

    // PRICES

    router.post('/prices', (req, res) => {
        res.send({
            status: 'success',
            data: prices
        });
    })

    router.post('/editprice', (req, res) => {
        let data = JSON.parse(req.body.data);
        let type = data.type;
        let price = data.price;

        db.collection('prices').doc(type).update({
            price: price,
        }).then((doc) => {
            res.send({
                status: 'success',
                data: prices
            });
        }).catch(error => {
            res.send({
                status: 'error',
                error: error
            })
        })
    })

    // SOLICITUDES

    router.post('/createrequest', (req, res) => {
        let data = JSON.parse(req.body.data);
        db.collection('requests').add(data).then(() => {
            res.send({
                status: 'success'
            });
        }).catch(error => {
            res.send({
                status: 'error',
                error: error
            })
        })
    })
}