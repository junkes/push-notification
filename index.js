const express = require('express')
const bodyParser = require('body-parser')
const webpush = require('web-push')
const path = require('path')
const fs = require('fs')
const app = express()

// Keys generateds by webpush 
const publicVapidKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
const privateVapidKey = 'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy'

const sendNotification = (subscription, message) => {
    webpush.sendNotification(subscription, message).catch(err => console.error(err))
}

if ( !fs.existsSync('./data/subscriptions.json') ) {
    try {
        fs.mkdirSync('data', { mode: 0770 })
        fs.writeFileSync('./data/subscriptions.json', '{}');
    } catch(err) {
        console.error(err)
    }
} else {
    setInterval( () => {
        let subscriptionsFile = fs.readFileSync('./data/subscriptions.json')
        let subscriptionsObject = JSON.parse(subscriptionsFile)
        let time = new Date()
        const message = JSON.stringify({ title: 'My WebApp - Current Time', 'body': `${time.getHours()}:${time.getMinutes()}` })
        for ( p256dh in subscriptionsObject ) {
            let subscription  = subscriptionsObject[p256dh]            
            delete subscription.time
            sendNotification( subscription, message, {TTL: 10} )
        }    
    }, 20000)
}

webpush.setVapidDetails(
  'mailto:teste@mail.com',
  publicVapidKey,
  privateVapidKey
);

app.use(express.static(path.join(__dirname, 'static')))

app.use(bodyParser.json())

app.post('/subscribe', (req, res) => {
    let subscriptionsFile = fs.readFileSync('./data/subscriptions.json')
    let subscriptionsObject = JSON.parse(subscriptionsFile)
    let now = new Date().toLocaleString()
    let subscription = req.body
    subscription.time = now 
    console.log('subscribe => ', subscription.keys.p256dh)
    subscriptionsObject[subscription.keys.p256dh] = subscription
    subscriptionsFile = JSON.stringify(subscriptionsObject)
    fs.writeFileSync('./data/subscriptions.json', subscriptionsFile)
    res.status(201).json(subscription)
    delete subscription.time
    const initialMessage = JSON.stringify({ title: 'My WebApp', 'body': 'Thank you for your subscription! :)' })
    sendNotification(subscription, initialMessage)
})

app.listen('3003', () => console.log('listening on port 3003'))

