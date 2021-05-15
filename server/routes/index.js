var express = require('express');
var router = express.Router();
const dbo = require("../db/conn");

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(87)
  res.render('index', { title: 'Express' });
});

function is_valid_signature(params, non_state) {

    // if(!non_state && this.config.nonce !== params['state']){
    //     return false;
    // }
    const crypto = require('crypto');

    var hmac = params['hmac'],
        theHash = params['hmac'] || params['signature'],
        secret = process.env.SHOPIFY_API_SECRET,
        parameters = [],
        digest,
        message;

    for (const key in params) {
        if (key !== "hmac" && key !== "signature") {
            parameters.push(key + '=' + params[key]);
        }
    }

    message = parameters.sort().join(hmac ? '&' : '');

    digest = crypto
                .createHmac('SHA256', secret)
                .update(message)
                .digest('hex');

    return ( digest === theHash );
}

function rand_between(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}


async function send(transporter, email) {
    await transporter.sendMail({
                from: '"" <adityapratapsingh51@gmail.com>', // this.state.sender address
                to: "adityapratapsingh51@gmail.com", // list of receivers
                subject: "Hello ✔", // Subject line
                text: "Hello world?", // plain text body
                html: email, // html body
            });
}

router.post('/sendmail', function (req) {
  console.log("GOT REQ")
  const SMTP_cred = req.body;

  const nodemailer = require("nodemailer");
  let transporter = nodemailer.createTransport({
      host: SMTP_cred['host'],
      port: parseInt(SMTP_cred['port']),
      secure: parseInt(SMTP_cred['port']) === 465, // true for 465, false for other ports
      auth: {
          user: SMTP_cred['user'],
          pass: SMTP_cred['pass'],
      },
  });
  send(transporter, SMTP_cred['email']).then(() => console.log("Email sent")).catch((err) => console.log(err))

})


router.post('/backup', function (req, res) {
    const db_connect = dbo.getDb('shopify')
    const myObj = {
        _id: req.body['token'],
        backup: req.body['backup']
    }

    db_connect
        .collection("shopify")
        .deleteOne({
            _id: req.body['token']
        })
    db_connect
        .collection("shopify")
        .insertOne(myObj, function (err, response) {
            if (err) console.log(err);
            else res.json(myObj)
        })
    
})

router.get('/backup', function (req, res) {
    const db_connect = dbo.getDb('shopify')
    db_connect
        .collection('shopify')
        .findOne({
            _id: req.query['token']
        }).then((doc) => res.json(doc)).catch((err) => console.log(err))
})


router.get('/login', function (req, res) {
    if (!req.query['hmac'] || is_valid_signature(req.query)) {
        const url = ("https://" + req.query["shop"] + "/admin/oauth/authorize?client_id=" + process.env.SHOPIFY_API_KEY +
            "&scope=write_content,write_themes,write_products,write_customers,write_orders,write_script_tags,write_fulfillments,write_shipping,read_analytics&redirect_uri="
            + process.env.BACKEND + "oauthcallback&state=" + rand_between(2, 12638).toString())
        res.redirect(url)
    }
})

router.get('/oauthcallback', function (req, res) {
    if (is_valid_signature(req.query)) {
            let shop = req.query['shop']
            if (!shop.startsWith("http")) {
                shop = "https://" + shop
            }
            if (!shop.endsWith('/')) {
                shop = shop + '/'
            }
            const axios = require('axios')
            axios.post(shop+"admin/oauth/access_token",{
                client_id: process.env.SHOPIFY_API_KEY,
                client_secret: process.env.SHOPIFY_API_SECRET,
                code: req.query['code']
            }).then((shopify_res) => {
                const url = process.env.FRONTEND + "login?token=" + shopify_res.data['access_token']
                res.redirect(url)
            })
    }
    else console.log("SIGNATURE VERIFICATION FAILED")
})

module.exports = router;
