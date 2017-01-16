'use strict';

const commander= require('commander');
const followPeople = require('../index');
const pkg = require('../package.json');

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
        .option('-p, --password <password>', 'Password for kintone');

    program.parse(argv);

    const fqdn = program.fqdn;
    const username = program.username;
    const password = program.password;

    if (!fqdn || !username || !password) {
        program.outputHelp();
        exit(1);
    }

    followPeople(fqdn, username, password).then(users => {
        console.log(`Done! Now following ${users.length} users.`);
    }).catch(err => {
        console.error(err.message);
        exit(1);
    });
}

module.exports = main;
