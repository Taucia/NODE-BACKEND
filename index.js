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
const path = require('path');

app.use(cors({
    origin: ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://192.168.9.62:8080/'],
    credentials: true
}));
// add cors to the app variable
app.use(
    router,
    express.json(),
    express.urlencoded({
        extended: true,
    })
);
// allow access to fetch data from the api externally by  Seting header
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "*");
//     res.setHeader("Access-Control-Allow-Methods", "*");
//     res.setHeader("Access-Control-Allow-*", "*");
//     next();
// });

// SERVER LISTEN
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
// nav router
// HOME PAGE ROUTER
router.get("/", (req, res) => {
    // res.status(200).sendFile("./views/index.html", {
    //     root: __dirname
    // });
    res.status(200).sendFile(path.join(__dirname, 'views/index.html'));
});

// register PAGE ROUTER
router.get("/register", (req, res) => {
    // res.status(200).sendFile("./views/register.html", {
    //     root: __dirname
    // });
    res.status(200).sendFile(path.join(__dirname, 'views/register.html'));
});

// login PAGE ROUTER
router.get("/login", (req, res) => {
    // res.status(200).sendFile("./views/login.html", {
    //     root: __dirname
    // });
    res.status(200).sendFile(path.join(__dirname, 'views/login.html'));
});

// products PAGE ROUTER
router.get("/prod", (req, res) => {
    // res.status(200).sendFile("./views/products.html", {
    //     root: __dirname
    // });
    res.status(200).sendFile(path.join(__dirname, 'views/products.html'));
});


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
            [bd.firstName,bd.lastName,bd.email,bd.password],
            (err, results)=>{
                if(err) {
                    console.log(err);
                    res.send(`
                    <h1>${err}.</h1><br>
                    <a href="/register">Go Back</a>
                    `)}
                    else{console.log(`${results}`);
                    res.send(`<nav>
                    <a href="/">home</a>
                    <a href="/register">register</a>
                    <a href="/login">login</a>
                    <a href="/products">products</a>
                   </nav> <br> ${result.affectedRows} USER ADDEED`)
                    
                }
                })
    }catch(e) {
        console.log(`FROM REGISTER: ${e.message}`);
    }
});

//login
app.post('/login',bodyParser.json(),async(req,res)=>{
    try{
        //get email and password
        const{email,password} = req.body;

        //mySQL query
        const strQry =
        `
        SELECT email, password FROM users WHERE email = '${email}';
        `;
        db.query(strQry,async(err,results)=>{
            if(err){
                console.log(err);
                res.send(`
                <h1>${err}.</h1><br>
                <a href="/register">Go Back.</a>
                `)
            }else{
                switch(true){
                    case(await compare(password,results[0].password)):
                    res.send('login was successfull.')
                    break
                    default:
                        console.log("Logged In failed.");
                        //res.redirect('/login');
                        res.send(`        <h1>Email or Password was Incorrect.<br>Please Insert the correct Email & Password.</h1><br>
                        <a href="/login">Go Back.</a>
                        `);
                    };
                }
                })
            } catch(e){
                console.log(`FROM LOGIN ${e.message}.`);
                res.send(`
                ${e.message}.<br>
                <a href="/login">Go Back.</a>
                `)
            }
        }
);
// get all users
router.get('/users',(req,res)=>{
    //mySQL query
    const strQry =`SELECT * FROM users`;
    db.query(strQry,(err,results)=>{
        if(err){
            console.log(err);
            res.send(`
            <h1>${err}.</h1><br>
            <a href="/">Go Back.</a>
            `)
        } else{
            res.json({
                status:200,
                results:results,
            })
        }
    })
});
// get 1 user
router.get('/users/:id',(req,res)=>{
    //mySQL query
    const strQry =
    `
    SELECT * FROM users WHERE id = ?;
    `;
    db.query(strQry,[req.params.id],(err,results) =>{
        if(err)throw err;
        res.json({
            status:200,
            results:(results.length<=0)?'Sorry no product was found':results
        })
    })
});
//delete user
app.delete('/users/:id',(req, res)=>{
    //mySQL query
    const strQry =
    `
    DELETE FROM users WHERE id = ?;
    ALTER TABLE users AUTO_INCREMENT = 1;
    `;
    db.query(strQry, [req.params.id], (err,results)=>{
        if(err) throw err;
        res.send(`USERS WAS DELETED`);
    });
});
//Update user
router.put("/users/:id",bodyParser.json(),async(req,res)=>{
    const {firstName, lastName, email, password} = req.body;
    let sql = `UPDATE users SET ? WHERE id =${req.params.id}`;
    const user = {
        firstName, lastName,email,password
    };
    db.query(sql,user,(err)=>{
        if(err){
            console.log(err);
            res.send(`
            <h1>${err}.</h1><br>
            <a href="/register">Go Back.</a>
            `)
        } else{
            res.json({
                msg:"Updated user Successfully",
            });
        }
    });
});


// Create a new products

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

// get all products

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

0


//*UPDATE A PRODUCT*//

router.put("/products/:id", bodyParser.json(), (req, res) => {
    // const bd = req.body;
    // Query
    const strQry = `
    UPDATE products 
    SET title=?, author=?, category=?, description=?,  img=?,pdf=?
    WHERE id=?`;
    db.query(
        strQry,
        [req.body.title, req.body.author, req.body.category, req.body.description, req.body.img, req.body.pdf, req.params.id],
        (err, results) => {
            if (err) throw err;
            res.send(`${results.affectedRows} PRODUCT/S UPDATED`);
        }
    );
});

//*DELETE A PRODUCT WITH A SPECIFIC ID*//

app.delete("/products/:id", (req, res) => {
    // QUERY
    const strQry = `
    DELETE FROM products 
    WHERE id = ?;
    ALTER TABLE products AUTO_INCREMENT = 1;
    `;
    db.query(strQry, [req.params.id], (err, data) => {
        if (err) throw err;
        res.send(`${data.affectedRows} PRODUCT/S WAS DELETED`);
    });
});


// CART

//*ADD CART ITEMS FROM SPECIFIC USER*//
router.post('/users/:id/cart', bodyParser.json(), (req, res) => {

    // mySQL query
    let cart = `SELECT cart FROM users WHERE id = ${req.params.id};`;
    // function
    db.query(cart, (err, results) => {
        if (err) throw err
        if (results.length > 0) {
            let cart;
            if (results[0].cart == null) {
                cart = []
            } else {
                cart = JSON.parse(results[0].cart)
            }

    let { Prod_id } = req.body;
    // mySQL query
    let product = `Select * FROM products WHERE Prod_id = ?`;
    // function
    db.query(product, Prod_id, (err, productData) => {
        if (err) res.send(`${err}`)
        let data = {
            cart_id : cart.length + 1,
            productData
        }
        cart.push(data)
        console.log(cart);
        let updateCart = `UPDATE users SET cart = ? WHERE id = ${req.params.id}`
        db.query(updateCart, JSON.stringify(cart), (err, results) => {
            if (err) res.send(`${err}`)
            res.json({
                cart: results
            })
        })
    })
}})
});

//*GET CART ITEMS FROM SPECIFIC USER*
router.get("/users/:id/cart", (req, res) => {
// Query
const strQry = `
SELECT *
FROM users
WHERE id = ?;
`;
db.query(strQry, [req.params.id], (err, results) => {
    if (err) throw err;
    res.json({
        status: 200,
        results: JSON.parse(results[0].cart),
    });
});
});

//*GET single ITEMS FROM SPECIFIC USER*
router.get("/users/:id/cart/:id", (req, res) => {
// Query
const strQry = `
SELECT *
FROM users
WHERE id = ?;
`;
db.query(strQry, [req.params.id], (err, results) => {
    if (err) throw err;
    res.json({
        status: 200,
        results: JSON.parse(results[0].cart),
    });
});
});

//*DELETE CART ITEMS FROM SPECIFIC USER*
router.delete("/users/:id/cart", (req, res) => {
// Query
const strQry = `
UPDATE users
SET cart=null
WHERE id=?
`;
db.query(strQry, [req.params.id], (err, results) => {
    if (err) throw err;
    res.json({
        status: 200,
        results: results,
    });
});
});

// Delete by cart id
router.delete('/users/:id/cart/:cartId', (req,res)=>{
const delSingleCartId = `
    SELECT cart FROM users
    WHERE id = ${req.params.id}
`
db.query(delSingleCartId, (err,results)=>{
    if(err) throw err;
    if(results.length > 0){
        if(results[0].cart != null){
            const result = JSON.parse(results[0].cart).filter((cart)=>{
                return cart.cart_id != req.params.cartId;
            })
            result.forEach((cart,i) => {
                cart.cart_id = i + 1
            });
            const query = `
                UPDATE users
                SET cart = ?
                WHERE id = ${req.params.id}
            `
            db.query(query, [JSON.stringify(result)], (err,results)=>{
                if(err) throw err;
                res.json({
                    status:200,
                    result: "Successfully deleted item from cart"
                });
            })
        }else{
            res.json({
                status:400,
                result: "This user has an empty cart"
            })
        }
    }else{
        res.json({
            status:400,
            result: "There is no user with that id"
        });
    }
})
})









