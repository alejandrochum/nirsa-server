const { getAuth, idToken } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue, collection, onSnapshot } = require('firebase-admin/firestore');
const express = require('express');
const { json } = require('body-parser');
const router = express.Router();
const db = getFirestore();

module.exports = function (app) {

    const listeners = require('./listeners.js');

    let users = listeners.users;
    let prices = listeners.prices;
    let meals = listeners.meals;
    let requests = listeners.requests;
    let holidays = listeners.holidays;

    let period = () => {
        var today = new Date();
        var period = {
            start: '',
            end: ''
        };

        if (today.getDate() <= 20) {
            period.start = today.getFullYear() + "-" + (today.getMonth()) + "-" + 21 + " 00:00:00";
            period.end = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + 20 + " 00:00:00";
        } else {
            period.start = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + 21 + " 00:00:00";
            period.end = today.getFullYear() + "-" + (today.getMonth() + 2) + "-" + 20 + " 00:00:00";
        }
        return period;
    }

    // Validate User
    app.use('/users', router);
    router.use(function (req, res, next) {
        getAuth().verifyIdToken(req.body.token).then((decodedToken) => {
            res.locals.uid = decodedToken.uid;
            next();
        }).catch((error) => {
            res.send(error)
        })
    });

    router.post('/info', (req, res) => {
        let uid = res.locals.uid;
        users.forEach(user => {
            if (user.id === uid) {
                res.send(user);
            }
        })
    })

    // PRICES

    router.post('/prices', (req, res) => {
        res.send({
            prices: prices,
            status: 'success'
        })
    })

    // MEALS

    router.post('/meals', (req, res) => {
        let filtered = [];
        if (meals.length > 0) {
            meals.forEach(meal => {
                mealDate = new Date(meal.date._seconds * 1000);
                startDate = new Date(period().start);
                endDate = new Date(period().end);
                console.log(endDate);
                if (mealDate >= startDate && mealDate <= endDate && meal.user === res.locals.uid) {
                    filtered.push(meal);
                }
            })
            res.send({
                status: 'success',
                data: filtered
            })
        } else {
            res.send({
                status: 'success',
                data: []
            })
        }
    })

    router.post('/meals2', (req, res) => {
        let filtered = [];
        if (meals.length > 0) {
            meals.forEach(meal => {
                mealDate = new Date(meal.date._seconds * 1000);
                startDate = new Date(period().start);
                endDate = new Date(period().end);
                let month = endDate.getMonth() + 2;
                month = month > 12 ? 12 : month;
                endDate = endDate.getFullYear() + "-" + month + "-" + 20 + " 00:00:00";

                endDate = new Date(endDate);
                if (mealDate >= startDate && mealDate <= endDate && meal.user === res.locals.uid) {
                    filtered.push(meal);
                }
            })
            res.send({
                status: 'success',
                data: filtered
            })
        } else {
            res.send({
                status: 'success',
                data: []
            })
        }
    })

    router.post('/reactivatemeal', (req, res) => {
        console.log(req.body.id);
        const mealsRef = db.collection('meals').doc(req.body.id);
        mealsRef.update({ cancelled: false }).then(() => { res.send('success') }).catch(error => { res.send(error) });
    });

    router.post('/editmeal', (req, res) => {
        const mealsRef = db.collection('meals').doc(req.body.id);
        mealsRef.update({ type: req.body.type }).then(() => { res.send('success') }).catch(error => { res.send(error) });
    });

    router.post('/cancelmeal', (req, res) => {
        const mealRef = db.collection('meals').doc(req.body.id);
        mealRef.update({ cancelled: true }).then(() => { res.send('success') }).catch(error => { res.send(error) });
    })

    // SOLICITUDES
    router.post('/requests', (req, res) => {
        let uid = res.locals.uid;
        let data = [];
        requests.forEach(request => {
            mealDate = new Date(request.date);
            startDate = new Date(period().start);
            endDate = new Date(period().end);
            if (mealDate >= startDate && mealDate <= endDate && request.user === uid && request.approved) {
                data.push(request);
            }
        })

        console.log(data);

        res.send({
            status: 'success',
            data: data
        })
    })

    router.post('/holidays', (req, res) => {
        res.send({
            status: 'success',
            data: holidays
        });
    })

}