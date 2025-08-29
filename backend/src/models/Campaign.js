const db = require('../config/database');

class Campaign {
  static async findById(id) {
    return await db('campaigns')
      .select('campaigns.*', 'users.first_name as creator_first_name', 'users.last_name as creator_last_name')
      .leftJoin('users', 'campaigns.created_by', 'users.id')
      .where('campaigns.id', id)
      .first();
  }

  static async create(campaignData) {
    const [campaign] = await db('campaigns').insert(campaignData).returning('*');
    return campaign;
  }

  static async update(id, campaignData) {
    const [campaign] = await db('campaigns')
      .where({ id })
      .update({
        ...campaignData,
        updated_at: db.fn.now()
      })
      .returning('*');
    return campaign;
  }

  static async delete(id) {
    return await db('campaigns').where({ id }).del();
  }

  static async list(filters = {}, userId = null) {
    let query = db('campaigns')
      .select(
        'campaigns.*',
        'users.first_name as creator_first_name',
        'users.last_name as creator_last_name',
        db.raw('COUNT(leads.id) as lead_count')
      )
      .leftJoin('users', 'campaigns.created_by', 'users.id')
      .leftJoin('leads', 'campaigns.id', 'leads.campaign_id')
      .groupBy('campaigns.id', 'users.first_name', 'users.last_name');

    if (filters.status) {
      query = query.where('campaigns.status', filters.status);
    }

    if (filters.created_by) {
      query = query.where('campaigns.created_by', filters.created_by);
    }

    if (userId) {
      query = query.where('campaigns.created_by', userId);
    }

    const limit = Math.min(parseInt(filters.limit) || 50, 100);
    const offset = parseInt(filters.offset) || 0;

    return await query
      .orderBy('campaigns.created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  static async getStats(campaignId) {
    const stats = await db('leads')
      .select(
        db.raw('COUNT(*) as total_leads'),
        db.raw('SUM(CASE WHEN status = \'won\' THEN value ELSE 0 END) as won_value'),
        db.raw('COUNT(CASE WHEN status = \'won\' THEN 1 END) as won_count'),
        db.raw('COUNT(CASE WHEN status = \'lost\' THEN 1 END) as lost_count'),
        db.raw('AVG(value) as avg_lead_value')
      )
      .where('campaign_id', campaignId)
      .first();

    return {
      total_leads: parseInt(stats.total_leads) || 0,
      won_value: parseFloat(stats.won_value) || 0,
      won_count: parseInt(stats.won_count) || 0,
      lost_count: parseInt(stats.lost_count) || 0,
      avg_lead_value: parseFloat(stats.avg_lead_value) || 0,
      conversion_rate: stats.total_leads > 0 ? (stats.won_count / stats.total_leads * 100) : 0
    };
  }
}

module.exports = Campaign;
