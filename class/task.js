var cron = require('node-cron');
var request = require('request');

//run every 10 min cron for the get ehtreum value and store at database
module.exports = {

    setCronForEthereum: async function () {
        cron.schedule('*/10 * * * *', async () => {
            try {
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
                    console.log(data)
                    var ethereum = {};
                    ethereum.ethereum = data.ethereum.inr;
                    ethereum.date = new Date();
                    console.log(ethereum)
                    await db.collection('ethereumValue').insertOne(ethereum);
                })
            } catch (e) {
                console.log(e)
            }
        })
    }
}