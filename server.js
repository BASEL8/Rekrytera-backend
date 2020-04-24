const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');




//bring routes
const usersRoutes = require('./router/user')
const authRoutes = require('./router/auth')
const professionRoutes = require('./router/profession')
const CompanyRoutes = require('./router/company')
const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//app.use('/api/v1', router);
//db 
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true }).then(() => console.log('db connected'))
//middleware
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}
//routes middleware 
app.use('/api', usersRoutes)
app.use('/api', authRoutes)
app.use('/api', professionRoutes)
app.use('/api', CompanyRoutes)
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`server is running on port ${port} `)
})
