
const pushServerPublicKey = 'BJ_I4k_oiXowxpxJ0jvkPwN451dbIZOfbwSqJU5BrhLTBwxSXBSeNElTte9DJENb3cANDLdmPt3rPgMvkDkbtfA'

function post (path, body) {
  return fetch(path, {
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
  return fetch(path, {
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

let userSubscription
let subscriptionId

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
    subscribeToPushNotificationButton.disabled = false
  } else {
    sendPushNotificationButton.disabled = true
    subscribeToPushNotificationButton.disabled = true
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
function subscribeToPushNotification () {
  console.log('click subscribeToPushNotification')
  createNotificationSubscription().then(function (subscription) {
    showUserSubscription(subscription)
  })
}

/**
 * displays the subscription details in the page and enables the 'send Subscription Button'
 * @param {PushSubscription} subscription
 */
function showUserSubscription (subscription) {
  userSubscription = subscription

  // if (subscription) {
  //   console.log('subscription === ', subscription)
  //   let key = subscription.getKey ? subscription.getKey('p256dh') : ''
  //   let auth = subscription.getKey ? subscription.getKey('auth') : ''
  
  //   key = btoa(String.fromCharCode.apply(null, new Uint8Array(key)))
  //   auth = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)))
  //   console.log('key', key)
  //   console.log('auth', auth)
  //   console.log('subscription', subscription)
  // }

  document.getElementById('user-subscription').innerHTML = JSON.stringify(subscription, null, ' ')
  sendSubscriptionButton.disabled = false
}

/**
 * sends the push susbcribtion to the push server
 */
function sendSubscriptionToPushServer () {

  let key = userSubscription.getKey ? userSubscription.getKey('p256dh') : '';
  let auth = userSubscription.getKey ? userSubscription.getKey('auth') : '';
  key = btoa(String.fromCharCode.apply(null, new Uint8Array(key)));
  auth = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)));
  console.log('key === ', key)
  console.log('auth === ', auth)
  console.log('userSubscription === ', userSubscription)

  const data = {
    endpoint: userSubscription.endpoint,
    expirationTime: null,
    keys: {
      auth: auth,
      p256dh: key
    }
  }

  post('message/subscribe', data).then(function (response) {
    console.log(response)
    subscriptionId = 'test'
    sendPushNotificationButton.disabled = false
  })
}

// checks if the browser supports push notification and service workers
const pushNotificationSupported = isPushNotificationSupported()

const pushNotificationSupportedSpan = document.getElementById('push-notification-supported')
pushNotificationSupportedSpan.innerHTML = pushNotificationSupported

const askUserPermissionButton = document.getElementById('ask-user-permission-button')
askUserPermissionButton.addEventListener('click', askUserPermission)

const subscribeToPushNotificationButton = document.getElementById('create-notification-subscription-button')
subscribeToPushNotificationButton.addEventListener('click', subscribeToPushNotification)

const sendSubscriptionButton = document.getElementById('send-subscription-button')
sendSubscriptionButton.addEventListener('click', sendSubscriptionToPushServer)

const sendPushNotificationButton = document.getElementById('send-push-notification-button')
sendPushNotificationButton.addEventListener('click', sendNotification)

if (pushNotificationSupported) {
  updateUserConsent(Notification.permission)
  askUserPermissionButton.disabled = false
  // register the service worker: file 'sw.js' in the root of our project
  registerServiceWorker()
  getUserSubscription().then(function (subscription) {
    if (subscription) {
      console.log('subscription', subscription)

      showUserSubscription(subscription)
    }
  })
}
