import knex from './dbConn';

class InitDatabase {
  static CreateTablesIfNotExists() {
    knex.schema.hasTable('friend_scores').then(function (exists) {
      if (!exists) {
        return knex.schema.createTable('friend_scores', function (table) {
          table.string('user').unique();
          table.integer('duccs');
        });
      }
    });

    knex.schema.hasTable('killer_scores').then(function (exists) {
      if (!exists) {
        return knex.schema.createTable('killer_scores', function (table) {
          table.string('user').unique();
          table.integer('duccs');
        });
      }
    });

    knex.schema.hasTable('last_messages').then(function (exists) {
      if (!exists) {
        return knex.schema.createTable('last_messages', function (table) {
          table.string('user');
          table.string('server');
          table.string('message');
          table.dateTime('dateCreated').defaultTo(knex.fn.now());
        });
      }
    });

    knex.schema.hasTable('line_counts').then(function (exists) {
      if (!exists) {
        return knex.schema.createTable('line_counts', function (table) {
          table.integer('count');
          table.dateTime('date');
        });
      }
    });

    knex.schema
      .hasTable('online_users')
      .then(function (exists) {
        if (!exists) {
          return knex.schema.createTable('online_users', function (table) {
            table.string('user').unique();
            table.string('server');
            table.dateTime('dateCreated').defaultTo(knex.fn.now());
          });
        }
      })
      .then(() => {
        console.log('created all missing tables');
      })
      .catch((e) => console.log(e));
  }
}

export { InitDatabase };