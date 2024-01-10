const express = require('express');//express makes APIs - connect frontend to server
const app = express();//create express app
app.listen(3000);//listen on port 3000
console.log('hello world');

const boxes = [
    {boxId:1},
    {boxId:2},
    {boxId:3},
    {boxId:4}
];
//1st parameter url
//2nd a function to return boxes
//req= the request from the browser
//res= the response from the server
app.get('/boxes', (req, res) => {
    res.send(JSON.stringify(boxes));//send boxes as a string
    
})