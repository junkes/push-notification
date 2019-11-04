const publicVapidKey = 'BKH3LndHnvOeW9jSTb9B0LAa7gzj2jJXepSf96l8fu2lMZ6TMOIy3YlsGM85F7mUmk2f4qlX-ei-uadnNlBZqfI'

const urlBase64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const sender = async () => {
    console.log('Registering serviceWorker')
    const register = await navigator.serviceWorker.register('./service-worker.js', { scope: '/' })
    console.log('Servie Worker registered')

    console.log('Registering Push')
	const subscription = await register.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
	})
    console.log(subscription)
    console.log('Push registered')
    
    console.log('Send register')
    await fetch('/subscribe', {
        'method': 'POST',
        'body': JSON.stringify(subscription),
        'headers': {
            'Content-Type': 'application/json'
        }
    })
    console.log('Register sent')
	
}


if ('serviceWorker' in navigator) {
    sender().catch( err => console.error(err) )
}
