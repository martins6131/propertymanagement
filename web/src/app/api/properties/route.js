import sql from "@/app/api/utils/sql";

// Get all properties
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = 'SELECT * FROM properties';
    let params = [];
    
    if (search) {
      query += ' WHERE LOWER(name) LIKE LOWER($1) OR LOWER(address) LIKE LOWER($1) OR LOWER(property_type) LIKE LOWER($1)';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const properties = await sql(query, params);
    return Response.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return Response.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

// Create new property
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, address, property_type, total_units, monthly_rent, description } = body;
    
    if (!name || !address || !property_type) {
      return Response.json({ error: 'Name, address, and property type are required' }, { status: 400 });
    }
    
    const result = await sql`
      INSERT INTO properties (name, address, property_type, total_units, monthly_rent, description)
      VALUES (${name}, ${address}, ${property_type}, ${total_units || 1}, ${monthly_rent}, ${description})
      RETURNING *
    `;
    
    return Response.json(result[0]);
  } catch (error) {
    console.error('Error creating property:', error);
    return Response.json({ error: 'Failed to create property' }, { status: 500 });
  }
}