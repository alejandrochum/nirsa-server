const multer = require('multer');
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const path = require('path');
const { fstat } = require('fs');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

module.exports = function (app) {
    app.post("/upload", upload.single('image'), (req, res) => {
        // res.send(req.file.filename);
        let data = {
            filename: req.file.filename,
            link: req.body.link
        }
        db.collection('noticias').doc().set(data).then(() => {
            res.send('success');
        })
    })

    app.post('/deleteImage', (req) => {
        let name = req.body.name;
        fs.exists('./images/' + name, function (exists) {
            if (exists) {
                fs.unlink('./images/' + name, function () {
                    console.log(name + ' deleted')
                });
            } else {
                console.log(name + ' not found')
            }
        })
    })
}