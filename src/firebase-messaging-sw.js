importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

const firebaseConfig = {
    projectId: 'leaguemanager-39205',
    appId: '1:75265332276:web:cf19f01826a491d42aa661',
    storageBucket: 'leaguemanager-39205.firebasestorage.app',
    apiKey: 'AIzaSyDQBR64B-UAMXDmvz62oqQyzKzsWmuz6fQ',
    authDomain: 'leaguemanager-39205.firebaseapp.com',
    messagingSenderId: '75265332276'
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
