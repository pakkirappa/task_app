const db = require('../config/database');

class Lead {
  static async findById(id) {
    return await db('leads')
      .select(
        'leads.*',
        'campaigns.name as campaign_name',
        'assigned_user.first_name as assigned_first_name',
        'assigned_user.last_name as assigned_last_name'
      )
      .leftJoin('campaigns', 'leads.campaign_id', 'campaigns.id')
      .leftJoin('users as assigned_user', 'leads.assigned_to', 'assigned_user.id')
      .where('leads.id', id)
      .first();
  }

  static async create(leadData) {
    const [lead] = await db('leads').insert(leadData).returning('*');
    return lead;
  }

  static async update(id, leadData) {
    const [lead] = await db('leads')
      .where({ id })
      .update({
        ...leadData,
        updated_at: db.fn.now()
      })
      .returning('*');
    return lead;
  }

  static async delete(id) {
    return await db('leads').where({ id }).del();
  }

  static async list(filters = {}) {
    let query = db('leads')
      .select(
        'leads.*',
        'campaigns.name as campaign_name',
        'assigned_user.first_name as assigned_first_name',
        'assigned_user.last_name as assigned_last_name'
      )
      .leftJoin('campaigns', 'leads.campaign_id', 'campaigns.id')
      .leftJoin('users as assigned_user', 'leads.assigned_to', 'assigned_user.id');

    if (filters.status) {
      query = query.where('leads.status', filters.status);
    }

    if (filters.source) {
      query = query.where('leads.source', filters.source);
    }

    if (filters.campaign_id) {
      query = query.where('leads.campaign_id', filters.campaign_id);
    }

    if (filters.assigned_to) {
      query = query.where('leads.assigned_to', filters.assigned_to);
    }

    if (filters.search) {
      query = query.where(function() {
        this.where('leads.first_name', 'ilike', `%${filters.search}%`)
          .orWhere('leads.last_name', 'ilike', `%${filters.search}%`)
          .orWhere('leads.email', 'ilike', `%${filters.search}%`)
          .orWhere('leads.company', 'ilike', `%${filters.search}%`);
      });
    }

    const limit = Math.min(parseInt(filters.limit) || 50, 100);
    const offset = parseInt(filters.offset) || 0;

    return await query
      .orderBy('leads.created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  static async getStats() {
    const stats = await db('leads')
      .select(
        db.raw('COUNT(*) as total_leads'),
        db.raw('COUNT(CASE WHEN status = \'new\' THEN 1 END) as new_leads'),
        db.raw('COUNT(CASE WHEN status = \'contacted\' THEN 1 END) as contacted_leads'),
        db.raw('COUNT(CASE WHEN status = \'qualified\' THEN 1 END) as qualified_leads'),
        db.raw('COUNT(CASE WHEN status = \'proposal\' THEN 1 END) as proposal_leads'),
        db.raw('COUNT(CASE WHEN status = \'won\' THEN 1 END) as won_leads'),
        db.raw('COUNT(CASE WHEN status = \'lost\' THEN 1 END) as lost_leads'),
        db.raw('SUM(CASE WHEN status = \'won\' THEN value ELSE 0 END) as total_won_value'),
        db.raw('AVG(value) as avg_lead_value')
      )
      .first();

    return {
      total_leads: parseInt(stats.total_leads) || 0,
      new_leads: parseInt(stats.new_leads) || 0,
      contacted_leads: parseInt(stats.contacted_leads) || 0,
      qualified_leads: parseInt(stats.qualified_leads) || 0,
      proposal_leads: parseInt(stats.proposal_leads) || 0,
      won_leads: parseInt(stats.won_leads) || 0,
      lost_leads: parseInt(stats.lost_leads) || 0,
      total_won_value: parseFloat(stats.total_won_value) || 0,
      avg_lead_value: parseFloat(stats.avg_lead_value) || 0,
      conversion_rate: stats.total_leads > 0 ? (stats.won_leads / stats.total_leads * 100) : 0
    };
  }

  static async getStatsBySource() {
    return await db('leads')
      .select(
        'source',
        db.raw('COUNT(*) as count'),
        db.raw('COUNT(CASE WHEN status = \'won\' THEN 1 END) as won_count'),
        db.raw('SUM(CASE WHEN status = \'won\' THEN value ELSE 0 END) as won_value')
      )
      .groupBy('source')
      .orderBy('count', 'desc');
  }

  static async getStatsByStatus() {
    return await db('leads')
      .select(
        'status',
        db.raw('COUNT(*) as count'),
        db.raw('SUM(value) as total_value')
      )
      .groupBy('status')
      .orderBy(db.raw('CASE status WHEN \'new\' THEN 1 WHEN \'contacted\' THEN 2 WHEN \'qualified\' THEN 3 WHEN \'proposal\' THEN 4 WHEN \'won\' THEN 5 WHEN \'lost\' THEN 6 END'));
  }
}

module.exports = Lead;
