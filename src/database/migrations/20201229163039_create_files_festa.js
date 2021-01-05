
exports.up = function(knex) {
    return knex.schema.createTable("files_festa", function (table) {
        table.string("nome").notNullable();
        table.integer("size").notNullable();
        table.string("url").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.integer("festa_id").notNullable();
    
        table.foreign("festa_id").references("id").inTable("festa");
        table.string("key").primary().notNullable();
        
      });
};

exports.down = function(knex) {
  return knex.schema.dropTable("files_festa");
};
