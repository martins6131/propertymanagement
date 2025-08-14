import sql from "@/app/api/utils/sql";

// Get single property
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`SELECT * FROM properties WHERE id = ${id}`;
    
    if (result.length === 0) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }
    
    return Response.json(result[0]);
  } catch (error) {
    console.error('Error fetching property:', error);
    return Response.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

// Update property
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    if (body.name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      values.push(body.name);
      paramCount++;
    }
    if (body.address !== undefined) {
      updateFields.push(`address = $${paramCount}`);
      values.push(body.address);
      paramCount++;
    }
    if (body.property_type !== undefined) {
      updateFields.push(`property_type = $${paramCount}`);
      values.push(body.property_type);
      paramCount++;
    }
    if (body.total_units !== undefined) {
      updateFields.push(`total_units = $${paramCount}`);
      values.push(body.total_units);
      paramCount++;
    }
    if (body.monthly_rent !== undefined) {
      updateFields.push(`monthly_rent = $${paramCount}`);
      values.push(body.monthly_rent);
      paramCount++;
    }
    if (body.description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      values.push(body.description);
      paramCount++;
    }
    
    if (updateFields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `UPDATE properties SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);
    
    if (result.length === 0) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }
    
    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating property:', error);
    return Response.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

// Delete property
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`DELETE FROM properties WHERE id = ${id} RETURNING *`;
    
    if (result.length === 0) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }
    
    return Response.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return Response.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}