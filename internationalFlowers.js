//require("dotenv").config({ quiet: true });
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express(); 
const path = require("path");
const bodyParser = require("body-parser");
const portNumber = process.argv[2];
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const database = client.db("CMSC335DB");
const collection = database.collection("flowerOrders");
const prices = {gw: 10, iris: 12, lotus: 5, cb: 18, jasmine: 22, sunflower: 8};

function getFlowers(orders) {
    const {gw, iris, lotus, cb, jasmine, sunflower} = orders;
    let flowers = [];
    if (gw != 0) flowers.push(`Golden Wattle (${gw}x)`);
    if (iris != 0) flowers.push(`Iris (${iris}x)`);
    if (lotus != 0) flowers.push(`Lotus (${lotus}x)`);
    if (cb != 0) flowers.push(`Cherry Blossom (${cb}x)`);
    if (jasmine != 0) flowers.push(`Jasmine(${jasmine}x)`);
    if (sunflower != 0) flowers.push(`Sunflower (${sunflower}x)`);

    return flowers.join(", ");
}

function getTotal(orders) {
    const {gw, iris, lotus, cb, jasmine, sunflower} = orders;
    let total = 0;
    total += gw * prices.gw;
    total += iris * prices.iris;
    total += lotus * prices.lotus;
    total += cb * prices.cb;
    total += jasmine * prices.jasmine;
    total += sunflower * prices.sunflower;
    return total;
}

process.stdin.setEncoding("utf8");

app.use(bodyParser.urlencoded( { extended: false } ));

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.get("/", (req, res) => { 
    const variables = {
        gwPrice: `$${prices.gw}`,
        irisPrice: `$${prices.iris}`,
        lotusPrice: `$${prices.lotus}`,
        cbPrice: `$${prices.cb}`,
        jasminePrice: `$${prices.jasmine}`,
        sunflowerPrice: `$${prices.sunflower}`
    };
    res.render("index", variables);
}); 

// Connect to api and update prices with currceny exchange
// idk if api also provides currency symbols
// show error message is country isnt in api
app.post("/", (req, res) => { 
    const country = req.body.country;
    // const variables = {
    //     gwPrice:  ,
    //     irisPrice: ,
    //     lotusPrice:  ,
    //     cbPrice:  ,
    //     jasminePrice:  ,
    //     sunflowerPrice:  
    // };
    res.render("index", variables);
}); 

// needs completed so that order is posted to mongodb 
app.post("/buy", async (req, res) => { 
    try {
        const orders = {gw: req.body.gwOrder, 
                        iris: req.body.irisOrder, 
                        lotus: req.body.lotusOrder, 
                        cb: req.body.cbOrder, 
                        jasmine: req.body.jasmineOrder, 
                        sunflower: req.body.sunflowerOrder};
        const total = getTotal(orders);
        const variables = {
            email: req.body.email,
            phone: req.body.phone,
            name: req.body.name,
            address: req.body.name,
            country: req.body.name,
            flowers: getFlowers(orders),
            total: total
        };
        // await client.connect();
        // const order = { 
        //     date: ,
        //     email: variables.email,
        //     phone: variables.phone,
        //     name: variables.name,
        //     address: variables.name,
        //     country: variables.name,
        //     gw: orders.gw, 
        //     iris: orders.iris, 
        //     lotus: orders.lotus, 
        //     cb: orders.cb, 
        //     jasmine: orders.jasmine, 
        //     sunflower: orders.sunflower,
        //     total: total 
        // };
        // await collection.insertOne(application);
        res.render("orderConfirmation", variables);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

// needs completed so that every order is read from mongo and displayed
app.get("/orders", async (req, res) => { 
    try {
        // await client.connect();
        // const docs = await collection.find().toArray();
        let tableBody = "";
        
        // docs.forEach((order) => {
        //     const orders = {gw: order.gw, 
        //                     iris: order.iris, 
        //                     lotus: order.lotus, 
        //                     cb: order.cb, 
        //                     jasmine: order.jasmine, 
        //                     sunflower: order.sunflower};
        //     tableBody += `<tr><td>DATE<strong>${order.date}</strong></td></tr>`;
        //     tableBody += `<tr><td>E-MAIL ADDRESS<strong>${order.email}</strong></td></tr>`;
        //     tableBody += `<tr><td>PHONE NUMBER<strong>${order.phone}</strong></td></tr>`;
        //     tableBody += `<tr><td>NAME<strong>${order.name}</strong></td></tr>`;
        //     tableBody += `<tr><td>ADDRESS<strong>${order.address}</strong></td></tr>`;
        //     tableBody += `<tr><td>COUNTRY<strong>${order.country}</strong></td></tr>`;
        //     tableBody += `<tr><td>FLOWERS<strong>${getFlowers(orders)}</strong></td></tr>`;
        //     tableBody += `<tr><td>TOTAL<strong>${order.total}</strong></td></tr>`;
        //     tableBody += `<tr class="space"><td></td></tr>`;
        // });
        res.render("orders", { tbody: tableBody });
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);
