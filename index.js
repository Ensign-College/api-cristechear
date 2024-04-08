const Redis = require("redis");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const { addOrder, getOrder } = require("./services/orderservice.js");
const { addOrderItem, getOrderItem } = require("./services/Orders/OrderItems.js");
const Ajv = require("ajv");

exports.test = async (event, context) => {
    event.redisClient = redisClient;
    return {
        statusCode: 200,
        body: JSON.stringify({message: 'WORKS!', event, context})
    }
};

const client = Redis.createClient({
  url: "redis://localhost:6379",
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/boxes", async (req, res) => {
  let boxes = await client.json.get("boxes");
  res.send(JSON.stringify(boxes));
});

app.post("/boxes", async (req, res) => {
  const newBox = req.body;
  await client.json.arrAppend("boxes", "$", newBox);
  res.json(newBox);
});

app.post("/products", async (req, res) => {
  const newProduct = req.body;
  const productKey = `product:${newProduct.productID}-${Date.now()}`;

  try {
    await client.json.set(productKey, ".", newProduct);
    console.log("Product added successfully to Redis");
  } catch (error) {
    console.error("Error adding product to Redis:", error);
    res.status(500).send("Internal Server Error");
    return;
  }
  res.json(newProduct);
});

app.get("/products/:productID", async (req, res) => {
  let products = await client.json.get(`product:${req.params.productID}`);
  res.json(products);
});

app.post("/orders", async (req, res) => {
  let order = req.body;
  let responseStatus = order.productQuantity ? 200 : 400 && order.shippingAddress ? 200 : 400;

  if (responseStatus === 200) {
    try {
      await addOrder({ client, order });
    } catch (error) {
      console.error("Error adding order:", error);
      res.status(500).send("Internal Server Error");
      return;
    }
  } else {
    res.Status(responseStatus);
    res.send(`Missing one of the following fields: ${order.productQuantity ? "" : "productQuantity"} ${order.shippingAddress ? "" : "ShippingAddress"}`);
    return;
  }
  res.status(responseStatus).send();
});

app.get("/orders/:orderId", async (req, res) => {
  const orderId = req.params.orderId;
  let order = await getOrder({ redisClient, orderId });
  if (order === null) {
    res.status(404).send("Order not found");
  } else {
    res.json(order);
  }
});

// Lambda handler function
exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  let response;

  // Initialize Express app
  const server = app.listen(0); // 0 means random port

  // Mock event object to pass to Express
  const expressEvent = {
    httpMethod,
    path,
    body: JSON.stringify(body),
    headers: event.headers,
  };

  // Create a promise for handling Express app
  const expressPromise = new Promise((resolve) => {
    app(req, res, () => {
      resolve({
        statusCode: res.statusCode,
        body: res._getData(),
      });
    });
  });

  // Wait for the response from Express
  const expressResponse = await expressPromise;

  // Close the server
  server.close();

  // Return the response
  response = {
    statusCode: expressResponse.statusCode,
    body: expressResponse.body,
  };

  return response;
};
