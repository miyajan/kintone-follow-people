'use strict';

const commander = require('commander');
const followPeople = require('../index');
const pkg = require('../package.json');

/**
 * split value by comma
 * @param {string} value
 * @return {!Array.<string>}
 */
function separate(value) {
    return value.split(',');
}

/**
 * Main
 * @param {!Array} argv Arguments
 * @param {!Console} console Console
 * @param {!Function} exit Function to exit
 */
function main(argv, console, exit) {
    const program = new commander.Command();

    program
        .version(pkg.version, '-v, --version')
        .option('-f, --fqdn <fqdn>', 'FQDN for kintone')
        .option('-u, --username <username>', 'Username for kintone')
        .option('-p, --password <password>', 'Password for kintone')
        .option('-e, --excludes <codes>', 'Users not to subscribe. Comma separated list of login name.', separate)
        .option('-c, --config <path>', 'Path to config json file');

    program.parse(argv);

    let config = {};
    const configPath = program.config;
    if (configPath) {
        try {
            config = require(configPath);
        } catch (e) {
            console.error(`Error! Can't read config json: ${configPath}`);
            throw e;
        }
    }

    const fqdn = program.fqdn || config.fqdn;
    const username = program.username || config.username;
    const password = program.password || config.password;
    const excludes = program.excludes || config.excludes;

    if (!fqdn || !username || !password) {
        program.outputHelp();
        exit(1);
    }

    followPeople(fqdn, username, password, excludes).then(users => {
        console.log(`Done! Now following ${users.length} users.`);
    }).catch(err => {
        console.error(err.message);
        exit(1);
    });
}

module.exports = main;
