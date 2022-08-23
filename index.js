// IMPORTING MODULES
require("dotenv").config();
const db = require("./config/dbconn");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const {genSalt, compare, hash } = require("bcrypt");
const app = express();
const router = express.Router();
const port = parseInt(process.env.PORT) || 4000;

// SERVER LISTEN
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// allow access to fetch data from the api externally by  Seting header
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    next();
});

app.use(cors({
    origin: ['http://127.0.0.1:8080', 'http://localhost:8080'],
    credentials: true
}));

// add cors to the app variable
app.use(
    router,
    cors(),
    express.json(),
    express.urlencoded({
        extended: true,
    })
);

// nav router
// HOME PAGE ROUTER
router.get("/", (req, res) => {
    res.status(200).sendFile("./views/index.html", {
        root: __dirname
    });
});

// register PAGE ROUTER
router.get("/register", (req, res) => {
    res.status(200).sendFile("./views/register.html", {
        root: __dirname
    });
});

// login PAGE ROUTER
router.get("/login", (req, res) => {
    res.status(200).sendFile("./views/login.html", {
        root: __dirname
    });
});

// products PAGE ROUTER
// router.get("/prod", (req, res) => {
//     res.status(200).sendFile("./views/products.html", {
//         root: __dirname
//     });
// });


// connect to database (TO MAKE SURE ITS CONNECTED).
db.connect( (err) => {
    if(err){
        console.log(`mySQL is not connected...<br>
        ${err}`)
    } else{
        console.log('mySQL connected...')
    }
});

//register
app.post('/register',bodyParser.json(),async(req,res) => {
    try{
        const bd = req.body;
        // Encrypting a password
        // Default value of salt is 10.
        bd.password = await hash(bd.password,16);
        // mySQL query
        const strQry = 
        `
        INSERT INTO users(firstName,lastName,email,password)
        VALUES(?,?,?,? )
        `;
        db.query(strQry,
            [bd.firstname,bd.lastname,bd.email,bd.password],
            (err,result)=>{
                if(err) {
                    console.log(err);
                    res.send(`
                    <h1>${err}.</h1><br>
                    <a href="/register">Go Back</a>
                    `)}
                    else{console.log(results);
                    res.redirect('/login');
                }
                })
    }catch(e) {
        console.log(`FROM REGISTER: ${e.message}`);
    }
});



// get all products
router.post("/products",bodyParser.json(),(req,res) => {
    const bd = req.body;
    // bd.totalamount = bd.quantity * bd.price;
    // Query
    const strQry = `
    INSERT INTO products(title, author, Category,description, img, pdf) 
    VALUES(?, ?, ?, ?, ?, ?)`;
    db.query(
        strQry,
        [bd.title,bd.author, bd.category, bd.description, bd.img, bd.pdf],
        (err, results ) => {
            if(err) throw err;
            res.send(`${results.affectedRows} PRODUCT/S ADDED`);
        }
    );
});

router.get("/products", (req, res) => {
    // Query
    const strQry = `
    SELECT *
    FROM products;
    `;
    db.query(strQry, (err, results) => {
        if (err) throw err;
        res.json({
            status: 200,
            results: results,
        });
    });
});

