console.log('Service Worker loaded')

self.addEventListener('push', event => {
    const data = event.data.json()
    console.log('Push received from server')
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://engeadmin.engematica.com.br/icone.png'
    })
})

self.addEventListener('pushsubscriptionchange', event => {
  console.log('pushsubscriptionchange', event)
})

