var express = require('express');
var router = express.Router();
request = module.exports = require('request');

/* get transaction and save in data base  */
router.get('/getTransaction', async function (req, res, next) {
    var transactions = await getTransaction(req.params);
    console.log(transactions)
    res.json(transactions);
});
/* get user current balance and etheram value */
router.get('/getUserAndEtheramBalance', async function (req, res, next) {
    var userBalance = await getUserAndEtheramBalance(req.query);
    if (userBalance) {
        console.log('>>>route>>>>', userBalance)
        res.json(userBalance);
    }
});

/* get a trasaction by user address */
async function getTransaction() {
    return new Promise(function (resolve, reject) {
        const settings = {
            method: 'GET',
            headers: {
                'Content-Type': "application/json"
            }
        };
        var APIKEY = "3Z3RGE1XKUJ49RTC64NTYEPMBYAHEEYUPV";
        var userAddress = "0xce94e5621a5f7068253c42558c147480f38b5e0d";
        const options = {
            url: 'https://api.etherscan.io/api?module=account&action=txlist&address=' + userAddress + '&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=' + APIKEY,
            Method: 'GET'
        };

        request(options, async function (error, response, body) {
            var data = JSON.parse(body);
            var transactions = data.result;
            if (data.status == 1) {
                for (let i = 0; i < transactions.length; i++) {
                    transactions[i].address = userAddress;
                    await db.collection('transactions').insertOne(transactions[i])
                }
                resolve(data.result)
            }
        });
    })
}

async function getUserAndEtheramBalance(data) {

    return new Promise(function (resolve, reject) {
        var APIKEY = "3Z3RGE1XKUJ49RTC64NTYEPMBYAHEEYUPV";
        var userAddress = data.userAddress;
        const options = {
            url: 'https://api.etherscan.io/api?module=account&action=balance&address=' + userAddress + '&tag=latest&apikey=' + APIKEY,
            Method: 'GET'
        };
        request(options, async function (error, response, body) {
            var data = JSON.parse(body);
            var userBalance = parseInt(data.result);
            if (data.status == 1) {
                const options = {
                    url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr',
                    Method: 'GET'
                };

                request(options, async function (error, res, body) {
                    if (error) {
                        console.log('Error sending messages: ', error)
                        return false;
                    }
                    var data = JSON.parse(body);
                    console.log('get ethera', data)
                    var allTransaction = await db.collection('transactions').find({}).toArray();
                    var userBal = userBalance;
                    if (allTransaction.length > 0) {
                        for (let i = 0; i < allTransaction.length; i++) {
                            if (allTransaction[i].to == userAddress) {
                                userBal = parseInt(allTransaction[i].value) + parseInt(userBal);
                            }
                            if (allTransaction[i].from == userAddress) {
                                userBal = parseInt(userBal) - parseInt(allTransaction[i].value);
                            }
                        }
                    }
                    console.log('>>>>>>>>>>>>>', userBal)
                    resolve({ userBal: userBal, etheramBal: data.ethereum.inr })
                })
            }
        });
    })
}
module.exports = router;
