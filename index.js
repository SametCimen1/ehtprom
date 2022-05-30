var express  = require("express");
var app = express();

const path = require('path')
const cors = require('cors');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const pool = require('./pool');

const PORT = process.env.PORT || 5000;

const corsOptions ={
    origin:'https://ehtprom.herokuapp.com', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
  }
app.use(express.static(path.join(__dirname, "app/client/build")));
app.use(express.static("./app/client/build"));  
app.use(express.static('app/client/build'));
require('dotenv').config();
app.use(bodyParser.json());
app.use(cors(corsOptions))


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://ehtprom.herokuapp.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
}) 

const checkIfNum = (str) => {
    return /^\d+$/.test(str);
}
app.post("/signin",  (req, res) => {
    const {type, info} = req.body;
    if(type === "student"){
        if(checkIfNum(info)){ //only numbers
            const myNumber = parseInt(info)
            console.log(myNumber, typeof(myNumber))
            pool.query(`SELECT * FROM students WHERE studentId = ${info}`, (err, result) => {
                if(err){
                    console.log(err);
                    res.status(404).json("INTERNAL SERVER ERROR"    );
                }
                else if(result.rows.length === 0){
                    res.status(404).json("No student found with that id");
                }
                else{
                    res.status(200).json(result.rows);
                }
            })
        } 
        else{
            pool.query(`SELECT * FROM students WHERE name = $1`,[info], (err, result) => {
                if(err){
                    console.log(err);
                    res.status(400).json("INTERNAL SERVER ERROR");
                }
                else if(result.rows.length === 0){
                    res.status(404).json("No student found with that name");
                }
                else{
                    res.status(200).json(result.rows);
                }
            })
        }
    }
    else if(type === "guest"){
        pool.query(`SELECT * FROM guests WHERE name = $1`,[info], (err, result) => {
            if(err){
                console.log(err);
                res.status(400).json("INTERNAL SERVER ERROR");
            }
            else if(result.rows.length === 0){
                res.status(404).json("No guests found with that name");
            }
            else{
                res.status(200).json(result.rows);
            }
        })
    }
    else{
        res.status(400).send("Please enter a valid type")
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})