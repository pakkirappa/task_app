const db = require('../config/database');

class User {
  static async findById(id) {
    return await db('users').where({ id }).first();
  }

  static async findByEmail(email) {
    return await db('users').where({ email }).first();
  }

  static async create(userData) {
    const [user] = await db('users').insert(userData).returning('*');
    return user;
  }

  static async update(id, userData) {
    const [user] = await db('users')
      .where({ id })
      .update(userData)
      .returning('*');
    return user;
  }

  static async delete(id) {
    return await db('users').where({ id }).del();
  }

  static async list(filters = {}) {
    let query = db('users').select(
      'id', 'email', 'first_name', 'last_name', 'is_active', 'created_at'
    );

    if (filters.is_active !== undefined) {
      query = query.where('is_active', filters.is_active);
    }

    return await query.orderBy('created_at', 'desc');
  }
}

module.exports = User;
