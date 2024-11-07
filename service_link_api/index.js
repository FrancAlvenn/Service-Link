import express from 'express'
import authRoutes from './routes/auth.js'


const app = express()


app.use(express.json())

//Routes for api requests -- connected to routes/ directory
app.use("/api/auth", authRoutes);


app.listen(8080, () => {
    console.log("Connected");
})