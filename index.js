'use strict';

const fetch = require('node-fetch');
const Base64 = require('js-base64').Base64;

const USER_PATH = '/k/api/group/users.json';
const SUBSCRIBE_PATH = '/k/api/people/user/subscribe.json';
const EVERYONE_GROUP_ID = '7532782697181632513';
const MAX_GET_USERS_SIZE = 1000;

class KintoneFollowPeople {
    constructor(fqdn, username, password) {
        this._fqdn = fqdn;
        this._username = username;
        this._password = password;
    }

    /**
     * @return {!Thenable.<!Array.<!Object>>}
     */
    execute() {
        return this._getAllUsers().then(users => {
            users = users.filter(user => user.code !== this._username);
            let promise = Promise.resolve();
            users.forEach(user => {
                promise = promise.then(() => {
                    return this._subscribeUser(user);
                });
            });
            return promise.then(() => users);
        });
    }

    /**
     * @param {string} path
     * @param {!Object} data
     * @return {!Thenable}
     * @private
     */
    _postJson(path, data) {
        return fetch('https://' + this._fqdn + path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Cybozu-Authorization': Base64.encode(this._username + ':' + this._password)
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.status >= 200 && response.status < 300) {
                return response.json();
            } else {
                return Promise.reject(new Error(response.statusText));
            }
        });
    }

    /**
     * @param {!Array.<!Object>} users
     * @param {number} offset
     * @return {!Thenable}
     * @private
     */
    _getUsersRecursively(users, offset) {
        return this._postJson(USER_PATH, {
            'id': EVERYONE_GROUP_ID,
            'size': MAX_GET_USERS_SIZE,
            'offset': offset,
        }).then(resp => {
            users = users.concat(resp.result.entities);
            if (users.length < offset + MAX_GET_USERS_SIZE) {
                return users;
            }
            return this._getUsersRecursively(users, offset + MAX_GET_USERS_SIZE);
        });
    }

    /**
     * @return {!Thenable}
     * @private
     */
    _getAllUsers() {
        return this._getUsersRecursively([], 0);
    }

    /**
     * @param {!Object} user
     * @return {!Thenable}
     * @private
     */
    _subscribeUser(user) {
        console.log('Following... ' + user.name);
        return this._postJson(SUBSCRIBE_PATH, {
            'userId': user.id,
            'subscribe': true,
        });
    }
}

/**
 * @param {string} fqdn
 * @param {string} username
 * @param {string} password
 * @return {!Thenable.<!Array.<!Object>>}
 */
const followPeople = (fqdn, username, password) => {
    return new KintoneFollowPeople(fqdn, username, password).execute();
};

module.exports = followPeople;
