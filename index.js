require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mysql = require("mysql2");
const bodyParser = require('body-parser');
const session = require("express-session");
const CalculateTotal = require("./functions/CalculateTotal");
const IsProductsInCart = require("./functions/IsProductsInCart");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;
const cookieParser =require("cookie-parser");
const verifyToken = require('./functions/VerifyToken');
const diskStorage = require("./functions/diskStorage");
const fileFilter = require("./functions/fileFilter");
const multer = require("multer");
const upload = multer({storage:diskStorage,fileFilter})


// db connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASWORD,
    database: process.env.DB_NAME
})

// application
const app = express();

app.use(cookieParser())
app.use(session({secret:process.env.SESSION_SECRET}))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));
app.set("view engine","ejs");

// listening on server
app.listen(port);


// get login form 
app.get("/",(req,res)=>{
    if (req.cookies.userToken) {
        res.render("pages/home");
    }
    res.render("pages/login");
})

// get home page
app.get('/home',verifyToken, function(req,res){
    var cart = req.session.cart;
    var count = cart?cart.length: 0 ;
    var currentUser = jwt.verify(req.cookies.userToken,process.env.JWT_SECRET_KEY);
    connection.query("SELECT * FROM `products`",(err,result)=>{
        res.render("pages/index",{products:result,count,avatar:currentUser.avatar});
    })
})

// get all products page
app.get("/products",verifyToken,(req,res)=>{
    var cart = req.session.cart;
    var count = cart?cart.length: 0 ;
    var currentUser = jwt.verify(req.cookies.userToken,process.env.JWT_SECRET_KEY)
   
    connection.query("SELECT * FROM `products`",(err,result)=>{
        var dataLength = result?result.length:0;
        res.render("pages/products",{products:result,count:count,dataLength:dataLength,avatar:currentUser.avatar});
    })
})

// get kids category
app.get("/kids",verifyToken,(req,res)=>{
    var cart = req.session.cart;
    var count = cart?cart.length: 0 ;
    var currentUser = jwt.verify(req.cookies.userToken,process.env.JWT_SECRET_KEY)

    connection.query("SELECT * FROM `products` WHERE category=? ",["kids_clothes"],(err,result)=>{
        var dataLength = result?result.length:0;
        res.render("pages/products",{products:result,count:count,dataLength:dataLength,avatar:currentUser.avatar});
    })
})

// get men category
app.get("/men",verifyToken,(req,res)=>{
    var cart = req.session.cart;
    var count = cart?cart.length: 0 ;
    var currentUser = jwt.verify(req.cookies.userToken,process.env.JWT_SECRET_KEY)

    connection.query("SELECT * FROM `products` WHERE category=? ",["men_clothes"],(err,result)=>{
        var dataLength = result?result.length:0;
        res.render("pages/products",{products:result,count:count,dataLength:dataLength,avatar:currentUser.avatar});
    })
})

// get women category
app.get("/women",verifyToken,(req,res)=>{
    var cart = req.session.cart;
    var count = cart?cart.length: 0 ;
    var currentUser = jwt.verify(req.cookies.userToken,process.env.JWT_SECRET_KEY)

    connection.query("SELECT * FROM `products` WHERE category=? ",["women_clothes"],(err,result)=>{
        var dataLength = result?result.length:0;
        res.render("pages/products",{products:result,count:count,dataLength:dataLength,avatar:currentUser.avatar});
    })
})

// get footwear category
app.get("/footwear",verifyToken,(req,res)=>{
    var cart = req.session.cart;
    var count = cart?cart.length: 0 ;
    var currentUser = jwt.verify(req.cookies.userToken,process.env.JWT_SECRET_KEY)

    connection.query("SELECT * FROM `products` WHERE category=? ",["footwear"],(err,result)=>{
        var dataLength = result?result.length:0;
        res.render("pages/products",{products:result,count:count,dataLength:dataLength,avatar:currentUser.avatar});
    })
})

// get accessories category
app.get("/accessories",verifyToken,(req,res)=>{
    var cart = req.session.cart;
    var count = cart?cart.length: 0 ;
    var currentUser = jwt.verify(req.cookies.userToken,process.env.JWT_SECRET_KEY)

    connection.query("SELECT * FROM `products` WHERE category=? ",["accessories"],(err,result)=>{
        var dataLength = result?result.length:0;
        res.render("pages/products",{products:result,count:count,dataLength:dataLength,avatar:currentUser.avatar});
    })
})

// get jewellery category
app.get("/jewellery",verifyToken,(req,res)=>{
    var cart = req.session.cart;
    var count = cart?cart.length: 0 ;
    var currentUser = jwt.verify(req.cookies.userToken,process.env.JWT_SECRET_KEY)

    connection.query("SELECT * FROM `products` WHERE category=? ",["jewellery"],(err,result)=>{
        var dataLength = result?result.length:0;
        res.render("pages/products",{products:result,count:count,dataLength:dataLength,avatar:currentUser.avatar});
    })
})


// thank you page
app.get("/thanks",verifyToken,(req,res)=>{
    var getquery = "SELECT `name` FROM `customers` WHERE email=?" ;
    var currentUser = jwt.verify(req.cookies.userToken , process.env.JWT_SECRET_KEY)
    var customerEmail = currentUser.email;
    connection.query(getquery,[currentUser.email],(err,data)=>{
        if (err) {
           res.send("error : " + err.message); 
        } else {
            var insertquery = "INSERT INTO `orders`(`customer_email`, `cost`, `status`, `date`, `products_ids`) VALUES ?"
            var cost = req.session.total;
            var status = "paid with paypal";
            var date = new Date();
            var products_ids = "";
            var cart = req.session.cart;
            for (let i = 0; i < cart.length; i++) {
                if (products_ids=="") {
                    products_ids = cart[i].id;
                }else{
                    products_ids = products_ids + "," + cart[i].id;
                }
            };
            var values = [
                [customerEmail,cost,status,date,products_ids]
            ];
            connection.query(insertquery,[values],(err, result) => {
                if (err) {
                   res.send("error: " + err.message); 
                }else{
                    req.session.cart = [];
                    req.session.total = 0;
                    res.render("pages/thankyou",{user_name:data[0].name,avatar:currentUser.avatar});
                }
            })

        }
    })

})

//orders page
app.get("/orders",(req,res)=>{
    var currentUser = jwt.verify(req.cookies.userToken,process.env.JWT_SECRET_KEY);
    var CustomerEmail = currentUser.email;
    var cart = req.session.cart;
    var count = cart?cart.length: 0 ;
    var getQuery = "SELECT * FROM `orders` WHERE customer_email=?";
    connection.execute(getQuery,[CustomerEmail],(err,orders)=>{
        if (orders.length > 0) {
            connection.execute("SELECT * FROM `customers` WHERE email=?",[CustomerEmail],(err,customer)=>{
                res.render("pages/orders",{length:orders.length,orders,customer:customer[0],count,avatar:currentUser.avatar}) 
            })
        }else{
            res.render("pages/orders",{count,avatar:currentUser.avatar,length:orders.length});
        }
    })
})

// account page
app.get("/account",verifyToken,(req,res)=>{
    var getquery = "SELECT * FROM `customers` WHERE email=?" ;
    var currentUser = jwt.verify(req.cookies.userToken , process.env.JWT_SECRET_KEY);
    var UserEmail = currentUser.email;
    connection.query(getquery,[UserEmail],(err,data)=>{
        if (err) {
           res.send("error : " + err.message); 
        } else {
            res.render("pages/account",{user:data[0],password:currentUser.password,avatar:currentUser.avatar})
        }
    })

})

// register form
app.get("/register",(req,res)=>{
    res.render("pages/register");
})


// get all cart items
app.get('/cart',verifyToken,function(req,res) {
    var cart = req.session.cart;
    var total = req.session.total;
   
    res.render("pages/cart",{cart,total});
})


// add product to cart
app.post("/add_to_cart",function(req,res) {
    var id = req.body.id;
    var title = req.body.title;
    var price = req.body.price;
    var sale_price = req.body.sale_price;
    var quantity = req.body.quantity;
    var image = req.body.image;
    var category = req.body.category;
    var product = {id:id , title:title ,price:price, sale_price:sale_price , quantity:quantity , image:image , category:category};
    
    if (req.session.cart) {
        var cart = req.session.cart

        if (!IsProductsInCart(cart,id)) {
            cart.push(product);
        }else{
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].id === id) {
                    +(cart[i].quantity)++ 
                }
            }
        }
    }else{
        req.session.cart=[product];
        var cart = req.session.cart;
    }

    //calculate total
    CalculateTotal(cart,req);
    res.redirect("/cart");
})

// manage login
app.post("/manage_login",(req,res)=>{
    try {
        const { email, password } = req.body;
    
        const query = 'SELECT * FROM `customers` WHERE email = ?';
        connection.execute(query, [email], async (err, result) => {
          if (err) {
            res.status(500).send({ message: 'Error in database query' });
          } else {
            if (result.length == 0) {
              res.render("pages/loginerror");
            } else {
              const matched = await bcrypt.compare(password, result[0].password);
              if (matched) {
                
                // generate JWT token 
                const token = jwt.sign(
                    {email,password,avatar:result[0].avatar},
                    process.env.JWT_SECRET_KEY
                );

                res.cookie("userToken",token);
                res.redirect("/home");

              } else {
                res.render("pages/loginerror");
              }
            }
          }
        });
      } catch (err) {
        res.status(500).send({ message: err.message });
        res.send("Error")
      }

})

// manage logout
app.get("/logout",(req,res)=>{
    res.clearCookie('userToken');
    res.redirect("/");
})

// edit product quantity in cart
app.post("/edit_product_quantity",(req,res)=>{
    var id = req.body.id;
    var quantity = req.body.quantity;
    var decrement = req.body.decrement;
    var increment = req.body.increment;

    var cart = req.session.cart;

    if (increment) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id) {
              
                    +(cart[i].quantity)++
             
            }       
        }
    }
    if (decrement) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id) {
                if (cart[i].quantity>1) {
                    cart[i].quantity = parseInt(cart[i].quantity)-1
                }
            }       
        }
    }
    


    CalculateTotal(cart,req);
    res.redirect("/cart")
})

// remove item from cart
app.post("/remove_product",(req,res)=>{
    var id = req.body.id;
    var cart = req.session.cart;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            cart.splice(i,1);
        }
    }

    // re-calculate total
    CalculateTotal(cart,req);

    res.redirect("/cart");

})

// manage register data from form
app.post('/manage_register', upload.single("avatar") , async (req, res) => {
    try {
        const {customer_name, email, password, address} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const checkQuery = 'SELECT * FROM customers WHERE email = ?';
        connection.execute(checkQuery,[email], (error, result) => {
            if (error) {
                res.send("Error: " + error.message);
            } else {
                if (result.length > 0) {
                    res.status(400).render("pages/registererror");
                } else {
                    const insertQuery = "INSERT INTO `customers`(`name`, `avatar`, `email`, `password`, `address`) VALUES (?, ?, ?, ?, ?)";

                    connection.execute(insertQuery, [customer_name, req.file?req.file.filename:null ,  email, hashedPassword, address], (err, result) => {
                        if (err) {
                            res.send("Error: " + err.message);
                        } else {
                            res.redirect("/");
                        }
                    });

                    
                }
            }
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// search request
app.post("/search",(req,res)=>{
    var searchVal = req.body.search;
    var cart = req.session.cart;
    var count = cart?cart.length: 0 ;
    var Getquery = `SELECT * FROM products WHERE title LIKE '%${searchVal}%'`;
    var currentUser = jwt.verify(req.cookies.userToken,process.env.JWT_SECRET_KEY);
    connection.query(Getquery,(err,data)=>{
        res.render("pages/products",{products:data,count:count,dataLength:data.length,avatar:currentUser.avatar});
    })
})

// product details manager
app.post("/manage_details",(req,res)=>{
    var id = req.body.id;
    var title = req.body.title;
    var description = req.body.description;
    var price = req.body.price;
    var sale_price = req.body.sale_price;
    var category = req.body.category;
    var image = req.body.image;
    var image2 = req.body.image2;
    var cart = req.session.cart;
    var count = cart?cart.length: 0 ;
    var product = {id,title,price,sale_price,category,image,image2,description};
    var currentUser = jwt.verify(req.cookies.userToken,process.env.JWT_SECRET_KEY)

    res.render("pages/singleProduct",{product:product,count:count,avatar:currentUser.avatar})
})



// error handling page
app.all('*', (req,res)=> {
    return res.status(404).render("pages/404");
})

