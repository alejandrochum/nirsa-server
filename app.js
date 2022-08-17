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
var router = express.Router();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const cors = require('cors');
const { send } = require('process');
app.use(cors({
    origin: '*',
}));

let meals = listeners.meals;

// List batch of users, 1000 at a time.
// getAuth()
//     .listUsers(1000)
//     .then((listUsersResult) => {
//         listUsersResult.users.forEach((userRecord) => {
//             getAuth()
//                 .deleteUser(userRecord.uid)
//                 .then(() => {
//                     console.log('Successfully deleted user');
//                 })
//                 .catch((error) => {
//                     console.log('Error deleting user:', error);
//                 });
//         });
//     })
//     .catch((error) => {
//         console.log('Error listing users:', error);
//     });
app.get('/api/bulkcreateusers', (req, res) => {
    const fs = require("fs");
    const readline = require("readline");
    const stream = fs.createReadStream("FILE.csv");
    const rl = readline.createInterface({ input: stream });
    let users = [];
    rl.on("line", (row) => {
        data.push(row.split(","));
    });
    rl.on("close", () => {
        data.forEach(row => {
            users.push({
                id: row[0],
                name: row[1],
                lastname: row[2],
                email: row[3],
                company: row[4],
                active: true
            })
        })
        users.shift();
        users.forEach(user => {
            db.collection('colaboradores').doc(user.id).set(user).then(() => {
                console.log('Document successfully written!');
            }
            ).catch(error => {
                console.log('Error writing document: ', error);
            })
            // getAuth().createUser({
            //     email: user.email,
            //     emailVerified: false,
            //     password: '123456',
            //     displayName: user.name + " " + user.lastname.split(" ")[0],
            //     disabled: false
            // }).then((userRecord) => {
            //     console.log("Successfully created new user:", userRecord.uid);
            //     db.collection('colaboradores').doc(user.id).set(user).then(() => {
            //         console.log('Document successfully written!');
            //     }
            //     ).catch(error => {
            //         console.log('Error writing document: ', error);
            //     })
            // }).catch(error => {
            //     console.log(user.email, error)
            // })
        })
    });
})

app.post('/meals', (req, res) => {
    getAuth()
        .verifyIdToken(req.body.token)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            res.send({
                meals: meals.filter(meal => meal.user === uid),
                status: 'success'
            });
        })
        .catch((error) => {
            res.send({
                error: error,
                status: 'error'
            })
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


require('./admin-routes.js')(app);
require('./users-routes')(app);


var getUsers = () => {
    return users;
}
exports.getUsers = getUsers;

app.listen(4001, () => {
    console.log("Listening on 4001");
})