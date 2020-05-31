
const pushServerPublicKey = 'BJ_I4k_oiXowxpxJ0jvkPwN451dbIZOfbwSqJU5BrhLTBwxSXBSeNElTte9DJENb3cANDLdmPt3rPgMvkDkbtfA'

const host = ''
function post (path, body) {
  return fetch(`${host}${path}`, {
    credentials: 'omit',
    headers: { 'content-type': 'application/json;charset=UTF-8', 'sec-fetch-mode': 'cors' },
    body: JSON.stringify(body),
    method: 'POST',
    mode: 'cors'
  })
    .then(function (response) {
      return response
    })
    // .then(function (data) {
    //   console.log('response', response)
    //   return data
    // })
}

function get (path) {
  return fetch(`${host}${path}`, {
    credentials: 'omit',
    headers: { 'content-type': 'application/json;charset=UTF-8', 'sec-fetch-mode': 'cors' },
    method: 'GET',
    mode: 'cors'
  })
    .then(function (response) {
      return response.json()
    })
    .then(function (data) {
      return data
    })
}

/**
 * checks if Push notification and service workers are supported by your browser
 */
function isPushNotificationSupported () {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

/**
 * asks user consent to receive push notifications and returns the response of the user, one of granted, default, denied
 */
function initializePushNotifications () {
  // request user grant to show notification
  return Notification.requestPermission(function (result) {
    console.log('request permission result = ', result)
    return result
  })
}

/**
 * register service worker
 */
function registerServiceWorker () {
  navigator.serviceWorker.register('/sw.js').then(function (swRegistration) {
    // you can do something with the service wrker registration (swRegistration)
  })
}

/**
 * using the registered service worker creates a push notification subscription and returns it
 */
function createNotificationSubscription () {
  // wait for service worker installation to be ready, and then
  return navigator.serviceWorker.ready.then(function (serviceWorker) {
    // subscribe and return the subscription
    return serviceWorker.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: pushServerPublicKey
      })
      .then(function (subscription) {
        console.log('User is subscribed.', subscription)
        // Get public key and user auth from the subscription object
        return subscription
      })
      .catch(function (err) {
        console.log(err)
      })
  })
}

/**
 * returns the subscription if present or nothing
 */
function getUserSubscription () {
  // wait for service worker installation to be ready, and then
  return navigator.serviceWorker.ready
    .then(function (serviceWorker) {
      return serviceWorker.pushManager.getSubscription();
    })
    .then(function (pushSubscription) {
      return pushSubscription
    })
}

let userSubscrition
let subscritionId

/**
 * request the push server to send a notification, passing the id
 */
function sendNotification () {
  post(`/message/notify-all`, {
      title: "New Product Available ",
      body: "HEY! Take a look at this brand new t-shirt!",
      url: "/test"
  })
}

const pushNotificationConsentSpan = document.getElementById('push-notification-consent')

/**
 * updates the DOM printing the user consent and activates buttons
 * @param {String} userConsent
 */
function updateUserConsent (userConsent) {
  pushNotificationConsentSpan.innerHTML = userConsent
  if (userConsent === 'granted') {
    // enable push notification subscribe button
    susbribeToPushNotificationButton.disabled = false
  } else {
    sendPushNotificationButton.disabled = true
    susbribeToPushNotificationButton.disabled = true
  }
}

/**
 * ask the user consent to receive push notification
 */
function askUserPermission () {
  initializePushNotifications().then(updateUserConsent)
}

/**
 * creates a push notification subscription, that has to be sent to the push server
 */
function susbribeToPushNotification () {
  console.log('click susbribeToPushNotification')
  createNotificationSubscription().then(function (subscrition) {
    showUserSubscription(subscrition)
  })
}

/**
 * displays the subscription details in the page and enables the 'send Subscription Button'
 * @param {PushSubscription} subscrition 
 */
function showUserSubscription (subscrition) {
  userSubscrition = subscrition

  // if (subscrition) {
  //   console.log('subscription === ', subscription)
  //   let key = subscription.getKey ? subscription.getKey('p256dh') : ''
  //   let auth = subscription.getKey ? subscription.getKey('auth') : ''
  
  //   key = btoa(String.fromCharCode.apply(null, new Uint8Array(key)))
  //   auth = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)))
  //   console.log('key', key)
  //   console.log('auth', auth)
  //   console.log('subscrition', subscrition)
  // }

  document.getElementById('user-susbription').innerHTML = JSON.stringify(subscrition, null, ' ')
  sendSubscriptionButton.disabled = false
}

/**
 * sends the push susbcribtion to the push server
 */
function sendSubscriptionToPushServer () {

  let key = userSubscrition.getKey ? userSubscrition.getKey('p256dh') : '';
  let auth = userSubscrition.getKey ? userSubscrition.getKey('auth') : '';
  key = btoa(String.fromCharCode.apply(null, new Uint8Array(key)));
  auth = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)));
  console.log('key === ', key)
  console.log('auth === ', auth)
  console.log('userSubscrition === ', userSubscrition)

  const data = {
    endpoint: userSubscrition.endpoint,
    expirationTime: null,
    keys: {
      auth: auth,
      p256dh: key
    }
  }

  post('message/subscribe', data).then(function (response) {
    console.log(response)
    subscritionId = 'test'
    sendPushNotificationButton.disabled = false
  })
}

// checks if the browser supports push notification and service workers
const pushNotificationSuported = isPushNotificationSupported()

const pushNotificationSupportedSpan = document.getElementById('push-notification-supported')
pushNotificationSupportedSpan.innerHTML = pushNotificationSuported

const askUserPemissionButton = document.getElementById('ask-user-permission-button')
askUserPemissionButton.addEventListener('click', askUserPermission)

const susbribeToPushNotificationButton = document.getElementById('create-notification-subscription-button')
susbribeToPushNotificationButton.addEventListener('click', susbribeToPushNotification)

const sendSubscriptionButton = document.getElementById('send-subscription-button')
sendSubscriptionButton.addEventListener('click', sendSubscriptionToPushServer)

const sendPushNotificationButton = document.getElementById('send-push-notification-button')
sendPushNotificationButton.addEventListener('click', sendNotification)

if (pushNotificationSuported) {
  updateUserConsent(Notification.permission)
  askUserPemissionButton.disabled = false
  // register the service worker: file 'sw.js' in the root of our project
  registerServiceWorker()
  getUserSubscription().then(function (subscrition) {
    if (subscrition) {
      console.log('subscrition', subscrition)
      showUserSubscription(subscrition)
    }
  })
}
