/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      
      table.index(['email']);
    })
    .createTable('campaigns', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.enum('status', ['draft', 'active', 'paused', 'completed']).defaultTo('draft');
      table.decimal('budget', 12, 2);
      table.date('start_date');
      table.date('end_date');
      table.uuid('created_by').references('id').inTable('users').onDelete('CASCADE');
      table.timestamps(true, true);
      
      table.index(['status', 'created_by']);
      table.index(['start_date', 'end_date']);
    })
    .createTable('leads', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('email').notNullable();
      table.string('phone');
      table.string('company');
      table.string('position');
      table.enum('status', ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).defaultTo('new');
      table.enum('source', ['website', 'referral', 'social', 'email', 'phone', 'other']).defaultTo('other');
      table.decimal('value', 12, 2);
      table.text('notes');
      table.uuid('campaign_id').references('id').inTable('campaigns').onDelete('SET NULL');
      table.uuid('assigned_to').references('id').inTable('users').onDelete('SET NULL');
      table.timestamps(true, true);
      
      table.index(['status', 'assigned_to']);
      table.index(['campaign_id']);
      table.index(['email']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('leads')
    .dropTableIfExists('campaigns')
    .dropTableIfExists('users');
};
