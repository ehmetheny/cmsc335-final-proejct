// require("dotenv").config({ quiet: true });
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express(); 
const path = require("path");
const bodyParser = require("body-parser");
const { StringDecoder } = require("string_decoder");
const portNumber = 5001;
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const database = client.db("CMSC335DB");
const collection = database.collection("flowerOrders");
const prices = {gw: 10, iris: 12, lotus: 5, cb: 18, jasmine: 22, sunflower: 8};
const countryCurrencies = {
    'USA': 'USD',
    'UK': 'GBP',
    'Japan': 'JPY',
    'India': 'INR',
    'Australia': 'AUD',
    'Canada': 'CAD',
    'Germany': 'EUR',
    'France': 'EUR',
    'Spain': 'EUR',
    'Italy': 'EUR',
    'China': 'CNY',
    'Mexico': 'MXN',
    'Brazil': 'BRL'
};

async function getExchangeRate(country) {
    try {
        const currency = countryCurrencies[country];
        
        if (!currency) {
            throw new Error(`Country "${country}" not supported`);
        }
        
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }
        
        const data = await response.json();
        
        return {
            rate: data.rates[currency] || 1,
            currency: currency,
            symbol: getCurrencySymbol(currency)
        };
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return { rate: 1, currency: 'USD', symbol: '$', error: error.message };
    }
}

function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'GBP': '£',
        'EUR': '€',
        'JPY': '¥',
        'INR': '₹',
        'AUD': 'A$',
        'CAD': 'C$',
        'CNY': '¥',
        'MXN': 'MX$',
        'BRL': 'R$'
    };
    return symbols[currency] || '$';
}

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

async function getTotal(orders, country) {
    const exchangeInfo = await getExchangeRate(country);
    const {gw, iris, lotus, cb, jasmine, sunflower} = orders;
    let total = exchangeInfo.symbol;
    let nTotal = 0;
    nTotal += gw * prices.gw * exchangeInfo.rate;
    nTotal += iris * prices.iris * exchangeInfo.rate;
    nTotal += lotus * prices.lotus * exchangeInfo.rate;
    nTotal += cb * prices.cb * exchangeInfo.rate;
    nTotal += jasmine * prices.jasmine * exchangeInfo.rate;
    nTotal += sunflower * prices.sunflower * exchangeInfo.rate;
    return total + nTotal;
}

process.stdin.setEncoding("utf8");

app.use(bodyParser.urlencoded( { extended: false } ));
app.use(express.static(path.resolve(__dirname)));


app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.get("/", (req, res) => { 
    res.redirect("/index");
}); 

app.get("/index", (req, res) => { 
    const variables = {
        usa: 'selected',
        uk: '',
        japan: '',
        india: '',
        australia: '',
        canada: '',
        germany: '',
        france: '',
        spain: '',
        italy: '',
        china: '',
        mexico: '',
        brazil: '',
        gwPrice: `$${prices.gw}`,
        irisPrice: `$${prices.iris}`,
        lotusPrice: `$${prices.lotus}`,
        cbPrice: `$${prices.cb}`,
        jasminePrice: `$${prices.jasmine}`,
        sunflowerPrice: `$${prices.sunflower}`
    };
    res.render("index", variables);
}); 

app.post("/index", async (req, res) => { 
    let country = req.body.country;
    let variables;
    
    // Get exchange rate for the selected country
    const exchangeInfo = await getExchangeRate(country);

    // Check if country is not supported or API error
    if (exchangeInfo.error) {
        variables = {
            usa: '',
            uk: '',
            japan: '',
            india: '',
            australia: '',
            canada: '',
            germany: '',
            france: '',
            spain: '',
            italy: '',
            china: '',
            mexico: '',
            brazil: '',
            gwPrice: `$${prices.gw}`,
            irisPrice: `$${prices.iris}`,
            lotusPrice: `$${prices.lotus}`,
            cbPrice: `$${prices.cb}`,
            jasminePrice: `$${prices.jasmine}`,
            sunflowerPrice: `$${prices.sunflower}`,
            errorMessage: `Error: ${exchangeInfo.error}. Showing prices in USD.`
        };
    } else {
        // Convert prices to local currency
        variables = {
            usa: '',
            uk: '',
            japan: '',
            india: '',
            australia: '',
            canada: '',
            germany: '',
            france: '',
            spain: '',
            italy: '',
            china: '',
            mexico: '',
            brazil: '',
            gwPrice: `${exchangeInfo.symbol}${(prices.gw * exchangeInfo.rate).toFixed(2)}`,
            irisPrice: `${exchangeInfo.symbol}${(prices.iris * exchangeInfo.rate).toFixed(2)}`,
            lotusPrice: `${exchangeInfo.symbol}${(prices.lotus * exchangeInfo.rate).toFixed(2)}`,
            cbPrice: `${exchangeInfo.symbol}${(prices.cb * exchangeInfo.rate).toFixed(2)}`,
            jasminePrice: `${exchangeInfo.symbol}${(prices.jasmine * exchangeInfo.rate).toFixed(2)}`,
            sunflowerPrice: `${exchangeInfo.symbol}${(prices.sunflower * exchangeInfo.rate).toFixed(2)}`
        };
    }
    country = country.toLowerCase();
    variables[country] = "selected";
    res.render("index", variables);
}); 

// Buy page - shows order form
app.get("/buy", async (req, res) => {
    res.render("buy");
});

app.post("/buy", async (req, res) => { 
    try {
        const orders = {gw: req.body.gwOrder, 
                        iris: req.body.irisOrder, 
                        lotus: req.body.lotusOrder, 
                        cb: req.body.cbOrder, 
                        jasmine: req.body.jasmineOrder, 
                        sunflower: req.body.sunflowerOrder};
        const country = req.body.country;
        const total = await getTotal(orders, country);
        const variables = {
            email: req.body.email,
            phone: req.body.phone,
            name: req.body.name,
            address: req.body.address,
            country: country,
            flowers: getFlowers(orders),
            total: total
        };
         await client.connect();
         const order = { 
            date: new Date().toLocaleString(),
            email: variables.email,
            phone: variables.phone,
            name: variables.name,
            address: variables.address,
            country: country,
            gw: orders.gw, 
            iris: orders.iris, 
            lotus: orders.lotus, 
            cb: orders.cb, 
            jasmine: orders.jasmine, 
            sunflower: orders.sunflower,
            total: total 
        };

        await collection.insertOne(order);
        res.render("orderConfirmation", variables);
    } catch (e) {
        console.error("Error in /buy post:", e);
    } finally {
        await client.close();
    }
});

app.get("/orders", async (req, res) => { 
    try {
        await client.connect();
        const docs = await collection.find().toArray();
        let tableBody = "";

        // please dont change html style :)
        docs.forEach((order) => {
             const orders = {gw: order.gw, 
                            iris: order.iris, 
                            lotus: order.lotus, 
                            cb: order.cb, 
                            jasmine: order.jasmine, 
                            sunflower: order.sunflower};
            tableBody += `<tr><td>DATE<strong>${order.date}</strong></td></tr>`;
            tableBody += `<tr><td>E-MAIL ADDRESS<strong>${order.email}</strong></td></tr>`;
            tableBody += `<tr><td>PHONE NUMBER<strong>${order.phone}</strong></td></tr>`;
            tableBody += `<tr><td>NAME<strong>${order.name}</strong></td></tr>`;
            tableBody += `<tr><td>ADDRESS<strong>${order.address}</strong></td></tr>`;
            tableBody += `<tr><td>COUNTRY<strong>${order.country}</strong></td></tr>`;
            tableBody += `<tr><td>FLOWERS<strong>${getFlowers(orders)}</strong></td></tr>`;
            tableBody += `<tr><td>TOTAL<strong>${order.total}</strong></td></tr>`;
            tableBody += `<tr class="space"><td></td></tr>`;
        });
        res.render("orders", { tbody: tableBody });
    } catch (e) {
        console.error("Error in /orders get:", e);
    } finally {
        await client.close();
    }
});

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);
