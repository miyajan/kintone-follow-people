'use strict';

const proxyquire = require('proxyquire');
const assert = require('assert');

describe('followPeople', function() {
    const fqdn = 'test.cybozu.com';
    const username = 'test-code1';
    const password = 'test-password';
    let sut, usersData, subscribeData;

    beforeEach(function() {
        usersData = [];
        subscribeData = [];
        sut = proxyquire('../../index', {
            'node-fetch': (url, opts) => {
                if (url === `https://${fqdn}/k/api/group/users.json`) {
                    usersData.push(opts.body);
                    return Promise.resolve({
                        status: 200,
                        json: () => Promise.resolve({
                            result: {
                                entities: [
                                    {
                                        code: 'test-code1',
                                        name: 'test-name1',
                                        id: 'test-id1'
                                    },
                                    {
                                        code: 'test-code2',
                                        name: 'test-name2',
                                        id: 'test-id2'
                                    },
                                    {
                                        code: 'test-code3',
                                        name: 'test-name3',
                                        id: 'test-id3'
                                    }
                                ]
                            }
                        })
                    });
                } else if (url === `https://${fqdn}/k/api/people/user/subscribe.json`) {
                    subscribeData.push(opts.body);
                    return Promise.resolve({
                        status: 200,
                        json: () => Promise.resolve()
                    })
                } else {
                    assert(false);
                }
            }
        });
    });

    it('follow people', function() {
        return sut(fqdn, username, password).then(users => {
            assert.deepEqual(usersData, [JSON.stringify({
                'id': '7532782697181632513',
                'size': 1000,
                'offset': 0
            })]);
            assert.deepEqual(subscribeData, [
                JSON.stringify({
                    'userId': 'test-id2',
                    'subscribe': true
                }),
                JSON.stringify({
                    'userId': 'test-id3',
                    'subscribe': true
                })
            ]);
            assert.deepEqual(users, [
                {
                    code: 'test-code2',
                    name: 'test-name2',
                    id: 'test-id2'
                },
                {
                    code: 'test-code3',
                    name: 'test-name3',
                    id: 'test-id3'
                }
            ]);
        });
    });

    it('only follow people included in --includes option if specified', function() {
        return sut(fqdn, username, password, [], ['test-code3']).then(users => {
            assert.deepEqual(subscribeData, [
                JSON.stringify({
                    'userId': 'test-id3',
                    'subscribe': true
                })
            ]);
            assert.deepEqual(users, [
                {
                    code: 'test-code3',
                    name: 'test-name3',
                    id: 'test-id3'
                }
            ]);
        });
    });
});
