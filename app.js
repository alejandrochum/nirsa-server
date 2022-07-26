const express = require('express');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getAuth, idToken } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue, collection, onSnapshot } = require('firebase-admin/firestore');
var serviceAccount = require("./serviceAccountKey.json");

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

var bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const cors = require('cors');
app.use(cors({
    origin: '*',
}));

var meals = [];

const period = () => {
    var today = new Date();
    var period = {
        start: '',
        end: ''
    };

    if (today.getDate() <= 20) {
        period.start = today.getFullYear() + "-" + (today.getMonth()) + "-" + 21 + " 00:00:00";
        period.end = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + 20 + " 00:00:00";
    } else {
        period.start = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + 20 + " 00:00:00";
        period.end = today.getFullYear() + "-" + (today.getMonth() + 2) + "-" + 21 + " 00:00:00";
    }
    return period;
}

listenForMeals();

function listenForMeals() {
    const query = db.collection('meals').where('date', '>=', new Date(period().start)).where('date', '<=', new Date(period().end));
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                meals.push(change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'modified') {
                const index = meals.findIndex(x => x.id === change.doc.id);
                meals.splice(index, 1, change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'removed') {
                const index = meals.findIndex(x => x.id === change.doc.id);
                meals.splice(index, 1);
                console.log(change.doc.data())
            }
        })

    })

}

app.post('/meals', (req, res) => {
    getAuth()
        .verifyIdToken(req.body.token)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            res.send(meals.filter(meal => meal.user === uid));
        })
        .catch((error) => {
            res.error(error);
        });
})

app.post('/todaymeals', (req, res) => {
    res.send(meals.filter(meal => meal.date.toDate().toDateString() === new Date().toDateString()));
});

app.post('/verifyEmail', (req, res) => {
    getAuth()
        .verifyIdToken(req.body.token)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            getAuth().updateUser(uid, { emailVerified: true })
            console.log("Email verified");
            res.send("verified");
        })
        .catch((error) => {
            // Handle error
        });
})

app.get('/createuser', (req, res) => {
    getAuth().createUser({
        email: 'clynic6@gmail.com',
        emailVerified: false,
        password: '123456',
        displayName: 'Kevin Briones',
        disabled: false
    }).then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully created new user:', userRecord.uid);
    })
        .catch((error) => {
            console.log('Error creating new user:', error);
        });
})

app.post('/reactivatemeal', (req, res) => {
    console.log(req.body.id);
    const mealsRef = db.collection('meals').doc(req.body.id);
    mealsRef.update({ cancelled: false }).then(() => { res.send('success') }).catch(error => { res.send(error) });
});

app.post('/editmeal', (req, res) => {
    console.log(req.body);
    const mealsRef = db.collection('meals').doc(req.body.id);
    mealsRef.update({ type: req.body.type }).then(() => { res.send('success') }).catch(error => { res.send(error) });
});

app.post('/cancelmeal', (req, res) => {
    const mealRef = db.collection('meals').doc(req.body.id);
    mealRef.update({ cancelled: true }).then(() => { res.send('success') }).catch(error => { res.send(error) });
})

app.post('/userreport', (req, res) => {
    getAuth()
        .verifyIdToken(req.body.token)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            let sdate = new Date(req.body.startdate);
            let edate = new Date(req.body.enddate);

            const mealsRef = db.collection('meals');
            mealsRef.where('user', '==', uid).where('date', '>=', sdate).where('date', '<=', edate).get().then(snapshot => {
                res.send(snapshot.docs.map(doc => doc.data()));
            }).catch(error => { res.send(error) });
        })
        .catch((error) => {
            // Handle error
        }).catch(error => { res.send(error) });
})

app.post('/chefreport', (req, res) => {
    getAuth().verifyIdToken(req.body.token)
        .then((decodedToken) => {
            let sdate = new Date(req.body.startdate);
            let edate = new Date(req.body.enddate);

            const mealsRef = db.collection('meals');
            mealsRef.where('date', '>=', sdate).where('date', '<=', edate).get().then(snapshot => {
                res.send(snapshot.docs.map(doc => doc.data()));
            }).catch(error => { res.send(error) });
        }).catch((error) => {

        })
})

app.post('/qrscanned', (req, res) => {
    let uid = req.body.qr;
    let today = new Date();
    sdate = today.setHours(0, 0, 0, 0);

    getAuth().getUser(uid).then((userRecord) => {
        let dateFilter = meals.filter(meal => meal.date.toDate().toDateString() === new Date().toDateString());
        let userFilter = dateFilter.filter(meal => meal.user === uid);
        if (userFilter[0] && !userFilter[0].used) {
            const mealsRef = db.collection('meals').doc(userFilter[0].id);
            mealsRef.update({ used: true })
        } 
        res.json({
            name: userRecord.displayName,
            meal: userFilter[0]
        })
    }).catch((error) => {
        res.send(error.message)
    });
})

app.listen(5000, () => {
    console.log("Listening on 5000");
})