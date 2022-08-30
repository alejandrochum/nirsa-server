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
const { send } = require('process');
app.use(cors({
    origin: '*',
}));

const listeners = require('./listeners.js');
const { response } = require('express');
let meals = listeners.meals;

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

async function asd(users) {
    for (let index = 0; index < users.length; index++) {
        const user = users[index];
        const recipients = [
            new Recipient('alejandro.chum@gmail.com', user.name + ' ' + user.lastname)
        ];

        const emailParams = new EmailParams()
            .setFrom("info@delinirsa.com")
            .setFromName("Deli Nirsa")
            .setRecipients(recipients)
            .setReplyTo("info@delinirsa.com")
            .setReplyToName("Deli Nirsa")
            .setSubject("Nuevo Usuario Deli Nirsa")
            .setHtml(`
                  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                      <head>
                          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                          <title>NIRSA</title>
                          <style type="text/css">
                              /* ----- Custom Font Import ----- */
                              @import url(https://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic&subset=latin,latin-ext);

                              /* ----- Text Styles ----- */
                              table{
                                  font-family: 'Lato', Arial, sans-serif;
                                  -webkit-font-smoothing: antialiased;
                                  -moz-font-smoothing: antialiased;
                                  font-smoothing: antialiased;
                              }


                          </style>


                      </head>

                      <body style="padding: 0; margin: 0;" bgcolor="#eeeeee">
                          <span style="color:transparent !important; overflow:hidden !important; display:none !important; line-height:0px !important; height:0 !important; opacity:0 !important; visibility:hidden !important; width:0 !important; mso-hide:all;"></span>

                          <!-- / Full width container -->
                          <table class="full-width-container" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" bgcolor="#eeeeee" style="width: 100%; height: 100%; padding: 30px 0 30px 0;">
                              <tr>
                                  <td align="center" valign="top">
                                      <!-- / 700px container -->
                                      <table class="container" border="0" cellpadding="0" cellspacing="0" width="700" bgcolor="#ffffff" style="width: 700px;">
                                          <tr>
                                              <td align="center" valign="top">


                                                  <!-- / Projects list -->
                                                  <table class="container projects-list" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding-top: 0px;">
                                                      <tr>
                                                          <td>
                                                              <table class="container" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                  <tr>
                                                                      <td align="left">
                                                                          <a href="#"><img src="https://admin.delinirsa.com/mails/img/header01.png" width="100%" height="auto" border="0" style="display: block;"></a>
                                                                      </td>


                                                                  </tr>


                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </table>
                                                  <!-- /// Projects list -->






                                                  <!-- / Title -->
                                                  <table class="container title-block" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                      <tr>
                                                          <td align="center" valign="top">
                                                              <table class="container" border="0" cellpadding="0" cellspacing="0" width="620" style="width: 620px;">
                                                                  <tr>
                                                                      <td style="padding: 35px 0 15px 0; font-size: 26px;" align="center">¡Bienvenido/a `+ user.name + `!</td>
                                                                  </tr>



                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </table>
                                                  <!-- /// Title -->










                                                  <!-- / CTA Block -->
                                                  <table class="container cta-block" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                      <tr>
                                                          <td align="center" valign="top">



                                                              <table class="container" border="0" cellpadding="0" cellspacing="0" width="620" style="width: 620px;">



                                                                  <tr>
                                                                      <td class="cta-block__content" style="padding: 20px 0 0px 0; font-size: 16px; line-height: 27px; color: #969696; text-align: center;">

                  Utiliza el siguiente usuario y contraseña<br>
                  para ingresar a la plataforma:<br><br>

                                                                          <div style="color:#286E9E; font-size: 26px;">Usuario: </div> <div style="color:#459973"><strong>`+ user.email + `</strong></div><br>


                                                                      <div style="color:#286E9E; font-size: 26px;">Contasena: </div> <div style="color:#459973"><strong>`+ user.password + `</strong></div><br>	
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td class="cta-block__content" style="padding: 0px 0 27px 0; font-size: 16px; line-height: 27px; color: #969696; text-align: center;">
                  Click en el botón de abajo para ingresar:
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td class="cta-block__content" style="padding: 0px 0 50px 0; font-size: 22px; line-height: 17px; text-align: center;">
                                                                      <span style="color: #000;"><a href="https://delinirsa.com" style="text-decoration: none;"><div class="boton-pro" style="padding: 3%; border-radius: 100px; color: #fff; background-color: #55A581;  width: 46%; margin-left: 25%; text-decoration: none;">Ingresar</div></a> </span><br>
                                                                      </td>
                                                                  </tr>
                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </table>
                                                  <!-- /// CTA Block -->
                                                  <!-- / Footer
                                                  <table class="container" border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="background-color: #001a33;">
                                                      <tr>
                                                          <td align="center">
                                                              <table class="container" border="0" cellpadding="0" cellspacing="0" width="620" align="center" style="border-top: 1px solid #eeeeee; width: 620px;">
                                                                  <tr>
                                                                      <td style="text-align: center; padding: 50px 0 1px 0;">
                                                                          <a href="#" style="font-size: 18px; letter-spacing: 2px; text-decoration: none; color: #d5d5d5;">www.linkparaingresoalsistema.com<br><br><br></a>
                                                                      </td>
                                                                  </tr>

                                                                  <tr>
                                                                      <td align="middle">
                                                                          <table width="60" height="2" border="0" cellpadding="0" cellspacing="0" style="width: 60px; height: 2px;">

                                                                          </table>
                                                                      </td>
                                                                  </tr>


                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </table>

                                                   -->

                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                      </body>
                  </html>`)
        mailersend.send(emailParams).then((response) => {
            console.log(response.status);
        });
        await sleep(1500);
    }
}


function getusers() {
    let data = [];
    const fs = require("fs");
    const readline = require("readline");
    const stream = fs.createReadStream("FILE - Copy.csv");
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
                password: row[5],
                active: true
            })
        })
        users.shift();
        let notSent = [];
        asd(users);
    })
}

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
// app.get('/api/bulkcreateusers', (req, res) => {
//     let data = [];
//     const fs = require("fs");
//     const readline = require("readline");
//     const stream = fs.createReadStream("FILE.csv");
//     const rl = readline.createInterface({ input: stream });
//     let users = [];
//     rl.on("line", (row) => {
//         data.push(row.split(","));
//     });
//     rl.on("close", () => {
//         data.forEach(row => {
//             users.push({
//                 id: row[0],
//                 name: row[1],
//                 lastname: row[2],
//                 email: row[3],
//                 company: row[4],
//                 active: true
//             })
//         })
//         users.shift();
//         users.forEach(user => {
//             // db.collection('colaboradores').doc(user.id).set(user).then(() => {
//             //     console.log('Document successfully written!', user);
//             // }
//             // ).catch(error => {
//             //     console.log('Error writing document: ', error);
//             // })
//             getAuth().createUser({
//                 uid: user.id,
//                 email: user.email,
//                 emailVerified: false,
//                 password: user.password,
//                 displayName: user.name + " " + user.lastname.split(" ")[0],
//                 disabled: false
//             }).then((userRecord) => {
//                 console.log("Successfully created new user:", userRecord.uid);
//                 db.collection('colaboradores').doc(user.id).set(user).then(() => {
//                     console.log('Document successfully written!');
//                 }
//                 ).catch(error => {
//                     console.log('Error writing document: ', error);
//                 })
//             }).catch(error => {
//                 console.log(user.email, error)
//             })
//         })
//     });
// })

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