// Importă SDK-ul Firebase (folosește versiunea 8.x.x pentru compatibilitate)
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Inițializează Firebase
const firebaseConfig = {
    projectId: 'leaguemanager-39205',
    appId: '1:75265332276:web:cf19f01826a491d42aa661',
    storageBucket: 'leaguemanager-39205.firebasestorage.app',
    apiKey: 'AIzaSyDQBR64B-UAMXDmvz62oqQyzKzsWmuz6fQ',
    authDomain: 'leaguemanager-39205.firebaseapp.com',
    messagingSenderId: '75265332276'
};

firebase.initializeApp(firebaseConfig);

// Configurează Firebase Messaging
const messaging = firebase.messaging();
``