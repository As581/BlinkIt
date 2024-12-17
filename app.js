const express = require('express');
const app = express();
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const productRouter = require('./routes/product');
const userRouter = require('./routes/user');
const cartRouter = require('./routes/cart');
const paymentRouter = require('./routes/payment');
const orderRouter = require('./routes/order');


const connectDB = require('./config/mongoose-connection');
const expressSession = require('express-session');
const flash = require("connect-flash");
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');

connectDB();
require('dotenv').config();
require('./config/google_oauth');
require('./config/RedisConfig');
require('./config/cloudinary');

app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(expressSession({
     resave:false,
     saveUninitialized:false,
     secret:"ggg",
}));
app.use(flash());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});
app.use('/',indexRouter);
app.use('/auth',authRouter);
app.use('/admin',adminRouter);
app.use('/products',productRouter);
app.use('/users',userRouter);
app.use('/cart',cartRouter);
app.use('/payment',paymentRouter);
app.use('/order',orderRouter);

app.use((req, res) => {
  res.send('404')
});

app.listen(process.env.PORT || 3002,()=>{
    console.log("Server is connected");
});
