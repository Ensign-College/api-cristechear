const Redis = require('redis');//redis is a key-value store

const express = require('express');//express makes APIs - connect frontend to server
// Connect Redis
const client = Redis.createClient({
    url: 'redis://localhost:6379'
  });
client.on('error', err => console.log('Redis Client Error', err));



const app = express();//create express app
const port = 3000;//set port

console.log('hello world');

//1st parameter url
//2nd a function to return boxes
//req= the request from the browser
//res= the response from the server

app.get('/boxes', (req, res) => {
    let boxes = client.json.get('boxes',{path:'$'});//get boxes from redis

    res.send(JSON.stringify(boxes));//send boxes as a string to the browser

})
app.listen(port, () => {
    client.connect();
    console.log(`Listening on port ${port}`);
});//listen on port 3000