const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-sdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://aneh-rf-gd-default-rtdb.firebaseio.com/' 
});

const database = admin.database();
const ref = database.ref('shortLinks');

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function checkLinkExists(shortLink) {
  return ref.child(shortLink).once('value').then((snapshot) => {
    if (snapshot.exists()) {
      return true;
    }
    return false;
  });
}

function generateUniqueShortLink() {
  const shortLink = generateRandomString(8); 
  return checkLinkExists(shortLink).then((exists) => {
    if (exists) {
      return generateUniqueShortLink();
    }
    return shortLink;
  });
}

function generateAndStoreShortLink(fullUrl) {
  return generateUniqueShortLink().then((shortLink) => {
    const linkData = {
      fullUrl: fullUrl
    };
    return ref.child(shortLink).set(linkData).then(() => {
      return shortLink;
    });
  });
}
const fullUrl = 'http://www.infiniteaccount.anehgaming.com';
generateAndStoreShortLink(fullUrl).then((shortLink) => {
  console.log('Short Link: ', shortLink);
  process.exit();
}).catch((error) => {
  console.error('Error: ', error);
  process.exit(1);
});
