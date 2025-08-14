import sql from "@/app/api/utils/sql";

// Get all maintenance requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    
    let query = `
      SELECT 
        mr.*,
        p.name as property_name,
        p.address as property_address,
        t.first_name,
        t.last_name,
        t.email as tenant_email
      FROM maintenance_requests mr
      LEFT JOIN properties p ON mr.property_id = p.id
      LEFT JOIN tenants t ON mr.tenant_id = t.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 1;
    
    if (status) {
      query += ` AND mr.request_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (priority) {
      query += ` AND mr.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }
    
    query += ' ORDER BY mr.created_at DESC';
    
    const requests = await sql(query, params);
    return Response.json(requests);
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return Response.json({ error: 'Failed to fetch maintenance requests' }, { status: 500 });
  }
}

// Create new maintenance request
export async function POST(request) {
  try {
    const body = await request.json();
    const { property_id, tenant_id, title, description, priority } = body;
    
    if (!property_id || !title || !description) {
      return Response.json({ error: 'Property ID, title, and description are required' }, { status: 400 });
    }
    
    const result = await sql`
      INSERT INTO maintenance_requests (property_id, tenant_id, title, description, priority)
      VALUES (${property_id}, ${tenant_id}, ${title}, ${description}, ${priority || 'medium'})
      RETURNING *
    `;
    
    return Response.json(result[0]);
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return Response.json({ error: 'Failed to create maintenance request' }, { status: 500 });
  }
}