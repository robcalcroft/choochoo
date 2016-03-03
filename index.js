require('babel-core/register');
require('dotenv').load();
var chalk = require('chalk');

console.log(
    chalk.gray.bgGreen('Transpiling Code')
);

require('controllers');
