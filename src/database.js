const firebase = require('firebase');
const {firebaseConfig} = require('../config-database.js');

firebaseConfig.apiKey = process.env.FIRE_BASE_API_KEY;
firebase.initializeApp(firebaseConfig);
const repository = firebase.database();

module.exports = {
    load : () => {
        return _load();
    },
    save : (json) => {
        _save(json);
    }
}

const _load = () => {
    return repository.ref('/contractResult').once('value')
    .then(snapshot => {
        return snapshot.val();
    });
}

const _save = (json) => {
    repository.ref('/contractResult').set(json);
}
