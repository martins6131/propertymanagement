import sql from "@/app/api/utils/sql";

// Get all tenants
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = 'SELECT * FROM tenants';
    let params = [];
    
    if (search) {
      query += ' WHERE LOWER(first_name) LIKE LOWER($1) OR LOWER(last_name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1)';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const tenants = await sql(query, params);
    return Response.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return Response.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// Create new tenant
export async function POST(request) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, phone, emergency_contact_name, emergency_contact_phone } = body;
    
    if (!first_name || !last_name || !email) {
      return Response.json({ error: 'First name, last name, and email are required' }, { status: 400 });
    }
    
    const result = await sql`
      INSERT INTO tenants (first_name, last_name, email, phone, emergency_contact_name, emergency_contact_phone)
      VALUES (${first_name}, ${last_name}, ${email}, ${phone}, ${emergency_contact_name}, ${emergency_contact_phone})
      RETURNING *
    `;
    
    return Response.json(result[0]);
  } catch (error) {
    console.error('Error creating tenant:', error);
    if (error.message.includes('unique constraint')) {
      return Response.json({ error: 'Email already exists' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}