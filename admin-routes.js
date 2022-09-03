const { getAuth, idToken } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue, collection, onSnapshot } = require('firebase-admin/firestore');
const express = require('express');
const { json } = require('body-parser');
const router = express.Router();
const db = getFirestore();
const Recipient = require("mailersend").Recipient;
const EmailParams = require("mailersend").EmailParams;
const MailerSend = require("mailersend");

const mailersend = new MailerSend({
    api_key: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYTZiNTY0MzNmZWUxYjRjY2FkMGVkNGM1YTliYWRjOGJlYTBkN2NjNjM0NmZlMWQ0MDg4NjYxZTE3YmM0Njk1Mjg4MDE3YWZhMDgyYmM2OTkiLCJpYXQiOjE2NjE4NTI0MTkuMDg0ODQ5LCJuYmYiOjE2NjE4NTI0MTkuMDg0ODUyLCJleHAiOjQ4MTc1MjYwMTkuMDgxMzQsInN1YiI6IjM2NDYzIiwic2NvcGVzIjpbImVtYWlsX2Z1bGwiLCJkb21haW5zX2Z1bGwiLCJhY3Rpdml0eV9mdWxsIiwiYW5hbHl0aWNzX2Z1bGwiLCJ0b2tlbnNfZnVsbCIsIndlYmhvb2tzX2Z1bGwiLCJ0ZW1wbGF0ZXNfZnVsbCIsInN1cHByZXNzaW9uc19mdWxsIiwic21zX2Z1bGwiLCJlbWFpbF92ZXJpZmljYXRpb25fZnVsbCJdfQ.CtGb0UjSjpsPN5KHQrCMlVthhsigIisEKAoFDF1sqRh2LMKs64lfFpuc4uAYCg3xcm47JlRH1bPvs4OiM2DyVgnnSLBllheg8z6vyB8A2gc8Pao0_6tUD3_JG4LYq9BKZfBqs1hGjzk1u58gj9C47w1TTW7fSh20ML9rotd9RZziGTqo7-PUDYMsUOcgwdlNmqJhDjDv5oWpG2V9xdIx7aaijYd7DXgkuR0NEKk0aCq5yqA-y9npdsO3bZuciI5MCh3ooEsf8T2PCY_Hk7lFzWCvUr_rBIFN0R81MHUZCohrpP_8V3gYshk3CIXu9xTK1-5-YvY722nJwnXLuF9bsZCyHaAhxDtEv-eACAE-zMDbW-n_J2rfT0MDQvb202fikXnaNCtlvwsIb7zg_hIvzO7hceniSc-tJgX4Y2Hm9jNysFnXDwU0LHMQ6QAZfhB9_kIEkRLitgQtpO_QkFpDS9kUjhpW-XSbigLPhq44ErNEHkTrF6bQXBbrke60sVkieAfsFsNqKP7g8KoZR1wEIHqiV5q8erUarpYP1MZ7DAlJlXFs8dgB9vbvbmGRjkWyAVMqYcxeMsiLNxAG-rE5XpMRKDmPJHOfg7wmh7QMXKzaeX3tWjuGsjjoUkTl-M7ht9bTnoPgbNl3ScBnd-1qqKxD5aBDmEhXhllEkKxzT1k'
});

module.exports = function (app) {

    const listeners = require('./listeners.js');

    let admins = listeners.admins;
    let companies = listeners.companies;
    let users = listeners.users;
    let prices = listeners.prices;
    let meals = listeners.meals;
    let requests = listeners.requests;
    let holidays = listeners.holidays;

    function SendEmail(mailOptions) {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }

    // Validate Admin
    app.use('/admin', router);
    router.use(function (req, res, next) {
        getAuth().verifyIdToken(req.body.token).then((decodedToken) => {
            let index = admins.findIndex(admin => admin.uid.toString() === decodedToken.uid);
            if (index > -1 && admins[index].type === 'NIRSA' || admins[index].type === 'Catering') {
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
        console.log(new Date().toLocaleDateString({timeZone: 'America/Ecuador'}));
        // let response = meals.filter(meal => meal.date.toDate().toDateString() === new Date().toDateString());
        // console.log(meals[1].date.toDate().toDateString(), new Date().toDateString())
        // console.log(response)
        // res.send(response);
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
        if (res.locals.admin.type == 'NIRSA') {
            res.send({
                admin: res.locals.admin,
                status: 'success'
            });
        } else {
            res.send({
                status: 'Not admin'
            });
        }
    });

    router.post('/cheflogin', (req, res) => {
        res.send({
            admin: res.locals.admin,
            status: 'success'
        });
    });

    router.post('/admins', (req, res) => {
        res.send(admins);
    })

    router.post('/deleteAdmin', (req, res) => {
        db.collection('admins').doc(req.body.uid).delete().then(() => {
            getAuth().deleteUser(req.body.uid).then(() => {
                res.send({
                    status: 'success',
                    admins: admins
                });
            }).catch((error) => {
                res.send({
                    status: 'error',
                    error: error
                });
            })
        }).catch((error) => {
            res.send({
                status: 'error',
                error: error
            });
        })
    })

    router.post('/createAdmin', (req, res) => {
        var val = Math.floor(1000 + Math.random() * 9000);
        var password = Math.floor(1000000 + Math.random() * 1000000).toString();
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
            password: password,
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
            db.collection('admins').doc('23646-' + val.toString()).set(data).then(() => {
                console.log('created admin db');
                res.send({
                    status: 'success'
                });
                var type = admin.type === 'NIRSA' ? 'Administrador' : 'Usuario Catering';
                const recipients = [
                    new Recipient(data.email, data.name + ' ' + data.lastname)
                ];

                const emailParams = new EmailParams()
                    .setFrom("info@delinirsa.com")
                    .setFromName("Deli Nirsa")
                    .setRecipients(recipients)
                    .setReplyTo("info@delinirsa.com")
                    .setReplyToName("Deli Nirsa")
                    .setSubject("Nuevo " + type + " Deli Nirsa")
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
                                                                        <td style="padding: 35px 0 15px 0; font-size: 26px;" align="center">¡Bienvenido/a `+ admin.name + `!</td>
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
                                                                            
                                                                            <div style="color:#286E9E; font-size: 26px;">Usuario: </div> <div style="color:#459973"><strong> `+ admin.email + `</strong></div><br>
                    
                    
                                                                        <div style="color:#286E9E; font-size: 26px;">Contasena: </div> <div style="color:#459973"><strong> `+ password + `</strong></div><br>	
                                                                        
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
                    console.log('email status: ' + response.status, 'to: ', data.email);
                })

            }).catch((error) => {
                console.log(error)
                res.send({
                    status: 'error',
                    error: error
                })
            })
        }).catch((error) => {
            console.log('Error creating new admin:', error);
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
            let mealstodelete = meals.filter(meal => meal.user === req.body.id);
            mealstodelete.forEach(meal => {
                let today = new Date().getTime();
                let mealDate = new Date(meal.date._seconds * 1000).getTime();
                if (mealDate > today) {
                    db.collection('meals').doc(meal.id).delete();
                    console.log('deleted meal', new Date(meal.date._seconds * 1000).toLocaleDateString());
                }
            })
            getAuth().deleteUser(req.body.id).then(() => {
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
            name: req.body.name,
            lastname: req.body.lastname
        }).then(() => {
            res.send('success');
        }).catch(error => {
            res.send('Error al editar el colaborador')
        })
    })

    router.post('/createcolaborador', (req, res) => {
        var password = Math.floor(1000000 + Math.random() * 1000000).toString();
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
            password: password,
            displayName: data.name + ' ' + data.lastname,
            disabled: false,
            emailVerified: false
        }).then((userRecord) => {
            db.collection('colaboradores').doc(data.id).set(data).then(() => {
                const recipients = [
                    new Recipient(data.email, data.name + ' ' + data.lastname)
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
                                                                              <td style="padding: 35px 0 15px 0; font-size: 26px;" align="center">¡Bienvenido/a `+ data.name + `!</td>
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
        
                                                                                  <div style="color:#286E9E; font-size: 26px;">Usuario: </div> <div style="color:#459973"><strong>`+ data.email + `</strong></div><br>
        
        
                                                                              <div style="color:#286E9E; font-size: 26px;">Contasena: </div> <div style="color:#459973"><strong>`+ password + `</strong></div><br>	
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
                    console.log('email status: ' + response.status, 'to: ', data.email);
                });
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
    router.post('/requests', (req, res) => {
        console.log(requests);
        res.send({
            status: 'success',
            data: requests
        })
    })

    router.post('/approverequest', (req, res) => {
        let data = JSON.parse(req.body.data);
        db.collection('requests').doc(data.id).update({
            approved: data.approved,
            pending: false,
        })
        res.send({
            status: 'success',
            data: requests
        })
    })

    router.post('/createrequest', (req, res) => {
        let data = JSON.parse(req.body.data);
        db.collection('requests').add(data).then(docRef => {
            db.collection('requests').doc(docRef.id).update({
                id: docRef.id
            }).then(() => {
                res.send({
                    status: 'success'
                });
            }).catch(error => {
                res.send({
                    status: 'error',
                    error: error
                })
            })
        }).catch(error => {
            res.send({
                status: 'error',
                error: error
            })
        })
    })

    // HOLIDAY
    router.post('/holidays', (req, res) => {
        res.send({
            status: 'success',
            data: holidays
        })
    })

    router.post('/addHoliday', (req, res) => {
        let holiday = req.body.holiday;
        db.collection('holidays').doc(holiday).set({
            date: holiday,
        }).then(docRef => {
            res.send({
                status: 'success',
                data: holiday
            })
        }).catch(error => {
            res.send({
                status: 'error',
                error: error
            })
        })
    })

    router.post('/deleteHoliday', (req, res) => {
        let holiday = req.body.holiday;
        db.collection('holidays').doc(holiday).delete().then(() => {
            res.send({
                status: 'success',
                data: holiday
            })
        }).catch(error => {
            res.send({
                status: 'error',
                error: error
            })
        })
    })

    router.post('/sendqrcode', (req, res) => {
        let data = req.body
        const recipients = [
            new Recipient(data.email)
        ];
        const emailParams = new EmailParams()
            .setFrom("info@delinirsa.com")
            .setFromName("Deli Nirsa")
            .setRecipients(recipients)
            .setReplyTo("info@delinirsa.com")
            .setReplyToName("Deli Nirsa")
            .setSubject("Tu codigo QR Deli Nirsa")
            .setHtml(
                ` <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
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
                                    
    
                                    
                                    
                                    <!-- / Divider -->
                                    <table class="container" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding-top: 25px;" align="center">
                                        <tr>
                                            <td align="center">
                                                <table class="container" border="0" cellpadding="0" cellspacing="0" width="620" align="center" style="border-bottom: solid 1px #eeeeee; width: 620px;">
                                                    <tr>
                                                        <td align="center">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- /// Divider -->
    
                                    <!-- / Title -->
                                    <table class="container title-block" border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="center" valign="top">
                                                <table class="container" border="0" cellpadding="0" cellspacing="0" width="620" style="width: 620px;">
                                                    <tr>
                                                        <td style="padding: 35px 0 15px 0; font-size: 26px;" align="center">!Hola `+ data.name + `!</td>
                                                        
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
                                                        <td class="cta-block__content" style="padding: 20px 0 27px 0; font-size: 16px; line-height: 27px; color: #969696; text-align: center;">
                                                            
    Aqui tienes tu codigo QR<br><br><br>
    <img src='`+ data.qrcode + `' alt="qrcode" height="200px">      
                                                        </td>
                                                    </tr>
                                                    
                                                  
                                                    <tr>
                                                        <td class="cta-block__content" style="padding: 0px 0 50px 0; font-size: 22px; line-height: 17px; text-align: center;">
                                                        
                                                        <span style="color: #2855E5; "><a href="#" style="text-decoration: none;"><div class="boton-pro" style="padding: 3%; text-transform: none; text-decoration: none; border-radius: 100px; color: #55A985; background-color: #fff; width: 46%; margin-left: 25%;">www.delinirsa.com</div></a> </span><br>
                                                        
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
                                                            <a href="www.linkparaingresoalsistema.com" style="font-size: 18px; letter-spacing: 2px; text-decoration: none; color: #d5d5d5;">www.linkparaingresoalsistema.com<br><br><br></a>
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
            console.log('email status: ' + response.status, 'to: ', data.email);
        });
        res.send({
            status: 'success'
        });
    })

}