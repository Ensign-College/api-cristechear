const Redis = require("redis"); //redis is a key-value store
const bodyParser = require("body-parser"); //this will transform te order request from json to the data base
const express = require("express"); //express makes APIs - connect frontend to server
const cors = require("cors"); //cors is used to allow cross-origin requests

const options = {
  origin: "http://localhost:3000", //allow requests from localhost:3000
};
// Connect Redis
const client = Redis.createClient({
  url: "redis://localhost:6379",
});
client.on("error", (err) => console.log("Redis Client Error", err));

const app = express(); //create express app
const port = 3001; //set port

console.log("hello world");

//1st parameter url
//2nd a function to return boxes
//req= the request from the browser
//res= the response from the server
app.use(bodyParser.json());
app.use(cors());//cors is used to allow cross-origin requests

app.get("/boxes", async (req, res) => {
  let boxes = await client.json.get("boxes"); //get boxes from redis

  res.send(JSON.stringify(boxes)); //send boxes as a string to the browser
});

app.post('/boxes', async (req, res) => { //async means we will await promises

    console.log(req.body);
    const newBox = req.body;
//   const newBox = {
//     boxId: req.body.boxId,
//   };
//   client.json.set('boxes', { path: '$', JSON.stringify(newBox) }) or
await client.json.arrAppend('boxes', '$',newBox) //add new box to boxes array in redis (req.body)

res.json(newBox)
});

app.listen(port, () => {
  client.connect();
  console.log(`Listening on port ${port}`);
}); //listen on port 3000
//A function to create a new product
app.post('/products', async (req, res)=>{// async means we will await promises

  const newProduct = req.body; //getting the body from postman, you can edit the products there!!!

  const productKey = `product:${newProduct.productID}-${Date.now()}`;//creating the unique product ID (to name it in redis), with the productID and the current date information

  try {
      // Set the value of the 'product' key in Redis with the JSON object
      await client.json.set(productKey, '.', newProduct);
      console.log('Product added successfully to Redis');
    } catch (error) {
      console.error('Error adding product to Redis:', error);
    }
  res.json(newProduct);//respond with a new product
});