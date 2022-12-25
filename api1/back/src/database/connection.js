const config        = require('../../config');

var knex = require('knex')({
  client: 'mysql2',
  connection: config.database
});

module.exports = knex