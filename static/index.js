const publicVapidKey = 'BIuz5ZRbVqHz9q1KY5_GrRJfAzgqGNyrFO9Lqq40L9GRM1UtUjCotSjofNBoXw9bN-Mb84KzmWQZkZhqf8ifdl4'

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

const requestNotificationPermission = async () => {

  const permission = await window.Notification.requestPermission();
  
  if(permission !== 'granted'){
      throw new Error('Permission not granted for Notification');
  }

}

const sender = async () => {

  await requestNotificationPermission()
    
  console.log('Registering serviceWorker')
  const register = await navigator.serviceWorker.register('./service-worker.js', { scope: '/' })
  console.log('Servie Worker registered')

  register.showNotification('Uauuuu!',{
    body: 'Obrigado por permitir nossas mensagens! :)'
  })

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
