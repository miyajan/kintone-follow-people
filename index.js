'use strict';

const fetch = require('fetch-with-proxy').default;
const Base64 = require('js-base64').Base64;

const USER_PATH = '/k/api/group/users.json';
const SUBSCRIBE_PATH = '/k/api/people/user/subscribe.json';
const EVERYONE_GROUP_ID = '7532782697181632513';
const MAX_GET_USERS_SIZE = 1000;

class KintoneFollowPeople {
    /**
     * Constructor
     * @param {string} fqdn FQDN
     * @param {string} username Username
     * @param {string} password Password
     * @param {Array.<string>=} opt_excludes Codes of users not to follow
     * @param {Array.<string>=} opt_includes Only follow users whose code included in this parameter
     */
    constructor(fqdn, username, password, opt_excludes, opt_includes) {
        this._fqdn = fqdn;
        this._username = username;
        this._password = password;
        this._excludes = opt_excludes || [];
        this._includes = opt_includes || [];
    }

    /**
     * Execute to follow peoples
     * @return {!Thenable.<!Array.<!Object>>} Thenable. Users are passed to then.
     */
    execute() {
        return this._getAllUsers().then(users => {
            users = users.filter(user => this._doSubscribe(user));
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
     * @param {string} path Path
     * @param {!Object} data Post data
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
     * @param {!Array.<!Object>} users Users
     * @param {number} offset Offset
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
     * @param {!Object} user User
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

    /**
     * @param {!Object} user User
     * @return {boolean}
     * @private
     */
    _doSubscribe(user) {
        // not subscribe myself
        if (user.code === this._username) {
            return false;
        }
        // not subscribe users included in --excludes option
        if (this._excludes.indexOf(user.code) > -1) {
            return false;
        }
        // not subscribe users not included in --includes option if specified
        if (this._includes.length > 0 && this._includes.indexOf(user.code) === -1) {
            return false;
        }
        // subscribe
        return true;
    }
}

/**
 * Follow people
 * @param {string} fqdn FQDN
 * @param {string} username Username
 * @param {string} password Password
 * @param {Array.<string>=} opt_excludes Codes of users not to follow
 * @param {Array.<string>=} opt_includes Only follow users whose code included in this parameter
 * @return {!Thenable.<!Array.<!Object>>} Thenable. Users are passed to then.
 */
const followPeople = (fqdn, username, password, opt_excludes, opt_includes) => {
    return new KintoneFollowPeople(fqdn, username, password, opt_excludes, opt_includes).execute();
};

module.exports = followPeople;
