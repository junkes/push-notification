const express = require('express')
const bodyParser = require('body-parser')
const webpush = require('web-push')
const path = require('path')
const fs = require('fs')
const app = express()

// Keys generateds by webpush
const publicVapidKey = 'BL1ymYO8-6b32YkraonEotoliOm8qF3nug_S8EN4yFnrOK9wYP3IG-Pt2fJxmLxrZATWdc6QJMvfkVy6Izra0mQ'
const privateVapidKey = 'UMHyyAuPVgvgCnLV19ERUOZQRdQ6kLc0Ibq9j_a8kmA'

const sendNotification = (subscription, message) => {
    webpush.sendNotification(subscription, message).then(
        event => null //console.log(event)
    ).catch(err => console.error(err))
}
if ( !fs.existsSync('./data/subscriptions.json') ) {
    try {
        if (!fs.existsSync('data')) fs.mkdirSync('data', { mode: 0770 })
        fs.writeFileSync('./data/subscriptions.json', '[]');
    } catch(err) {
        console.error(err)
    }
} else {
    setInterval( () => {
        let subscriptionsFile = fs.readFileSync('./data/subscriptions.json')
        let subscriptionsArray = JSON.parse(subscriptionsFile)
        let time = new Date()
        const message = JSON.stringify({ title: 'My WebApp - Current Time', 'body': `${time.getHours()}:${time.getMinutes()}` })
        for ( index in subscriptionsArray ) {
            let subscription  = subscriptionsArray[index]
            delete subscription.time
            sendNotification( subscription, message, {TTL: 10} )
        }
    }, 60000)
}

webpush.setVapidDetails(
  'mailto:julio@engematica.info',
  publicVapidKey,
  privateVapidKey
);

app.use(express.static(path.join(__dirname, 'static')))

app.use(bodyParser.json())

app.post('/subscribe', (req, res) => {
    let subscriptionsFile = fs.readFileSync('./data/subscriptions.json')
    let subscriptionsArray = JSON.parse(subscriptionsFile)
    let now = new Date().toLocaleString()
    let subscription = req.body.subscription
    subscription.clientIdentification = req.body.clientIdentification
    subscription.time = now
    subscriptionsArray.push(subscription)
    subscriptionsFile = JSON.stringify(subscriptionsArray)
    fs.writeFileSync('./data/subscriptions.json', subscriptionsFile)
    res.status(201).json(subscription)
    delete subscription.time
    setTimeout(() => {
        const initialMessage = JSON.stringify({ 'title': 'My WebApp', 'body': 'Thank you for your subscription! :)' })
        sendNotification(subscription, initialMessage)
    }, 10000)
})

const port = 3000

app.listen(port, () => console.log(`listening on port ${port}`))

