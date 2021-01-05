
exports.up = function(knex) {
    return knex.schema.createTable("files_organizador", function (table) {
        table.string("nome").notNullable();
        table.integer("size").notNullable();
        table.string("url").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.integer("email_organizador").notNullable();
    
        table.foreign("email_organizador").references("email").inTable("organizador");
        table.string("key").primary().notNullable();
      });
};

exports.down = function(knex) {
    return knex.schema.dropTable("files_organizador");
};
