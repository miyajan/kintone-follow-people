# kintone-follow-people

NPM package to follow people in kintone

[![npm version](https://img.shields.io/npm/v/kintone-follow-people.svg)](https://www.npmjs.com/package/kintone-follow-people)
[![npm downloads](https://img.shields.io/npm/dm/kintone-follow-people.svg)](https://www.npmjs.com/package/kintone-follow-people)
![Node.js Version Support](https://img.shields.io/badge/Node.js%20support-v4–v7-brightgreen.svg)
[![Build Status](https://travis-ci.org/miyajan/kintone-follow-people.svg?branch=master)](https://travis-ci.org/miyajan/kintone-follow-people)
[![dependencies Status](https://david-dm.org/miyajan/kintone-follow-people/status.svg)](https://david-dm.org/miyajan/kintone-follow-people)
[![Coverage Status](https://coveralls.io/repos/github/miyajan/kintone-follow-people/badge.svg?branch=master)](https://coveralls.io/github/miyajan/kintone-follow-people?branch=master)
![License](https://img.shields.io/npm/l/kintone-follow-people.svg)

## Description

This tool help to follow people in kintone.

## Install

```
$ npm install kintone-follow-people -g
```

## Usage

Follow all people in your kintone!

```
$ kintone-follow-people -f example.cybozu.com -u your-login-name -p your-password
```

## Options

### ```-f``` or ```--fqdn```

Specify FQDN of your kintone's domain.

### ```-u``` or ```--username```

Specify your login name.

### ```-p``` or ```--password```

Specify your password.

### ```-e``` or ```--excludes```

Specify users not to follow by comma-separated list of login names.

### ```-c``` or ```--config```

Specify a path to configuration file. You can load above options from the json file like:

```json
{
    "fqdn": "example.cybozu.com",
    "username": "your-login-name",
    "password": "your-password",
    "excludes": [
        "non-follow-user1",
        "non-follow-user2"
    ]
}
```

## Contribution

1. Fork
2. Create a feature branch
3. Commit your changes
4. Rebase your local changes against the master branch
5. Run `npm test`
6. Create new Pull Request

## License

MIT

## Author

[miyajan](https://github.com/miyajan): Jumpei Miyata miyajan777@gmail.com
