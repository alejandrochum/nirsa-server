const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getAuth, idToken } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue, collection, onSnapshot } = require('firebase-admin/firestore');
var serviceAccount = require("./serviceAccountKey.json");

const db = getFirestore();

var meals = [];
var users = [];
var admins = [];
var prices = [];
var companies = [];

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
        period.start = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + 20 + " 00:00:00";
        period.end = today.getFullYear() + "-" + (today.getMonth() + 2) + "-" + 21 + " 00:00:00";
    }
    return period;
}

listenForCompanies();
listenForAdmins();
listenForUsers();
listenForPrices();
listenForMeals();

function listenForCompanies() {
    const query = db.collection('companies');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                companies.push(change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'removed') {
                const index = companies.findIndex(x => x.name === change.doc.name);
                companies.splice(index, 1);
                console.log(change.doc.data())
            }
        })
    })
}

function listenForAdmins() {
    const query = db.collection('admins');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                admins.push(change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'modified') {
                const index = admins.findIndex(x => x.id === change.doc.id);
                admins.splice(index, 1, change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'removed') {
                const index = admins.findIndex(x => x.id === change.doc.id);
                admins.splice(index, 1);
                console.log(change.doc.data())
            }
        })
    })
}

function listenForUsers() {
    const query = db.collection('colaboradores').orderBy('lastname');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                users.push(change.doc.data());
                console.log('addded', change.doc.data())
            }
            if (change.type === 'modified') {
                const index = users.findIndex(x => x.id === change.doc.id);
                users.splice(index, 1, change.doc.data());
                console.log('edited', change.doc.data())
            }
            if (change.type === 'removed') {
                const index = users.findIndex(x => x.id === change.doc.id);
                users.splice(index, 1);
                console.log('removed', change.doc.data())
            }
        })
    })
}

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

function listenForPrices() {
    const query = db.collection('prices');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                prices.push(change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'modified') {
                const index = prices.findIndex(x => x.type === change.doc.id);
                prices.splice(index, 1, change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'removed') {
                const index = prices.findIndex(x => x.id === change.doc.id);
                prices.splice(index, 1);
                console.log(change.doc.data())
            }
        })
    })
}

exports.companies = companies;
exports.admins = admins;
exports.users = users;
exports.meals = meals;
exports.prices = prices;