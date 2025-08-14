import sql from "@/app/api/utils/sql";

// Update maintenance request status
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    if (body.request_status !== undefined) {
      updateFields.push(`request_status = $${paramCount}`);
      values.push(body.request_status);
      paramCount++;
      
      // If marking as completed, set completed_at timestamp
      if (body.request_status === 'completed') {
        updateFields.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }
    
    if (body.priority !== undefined) {
      updateFields.push(`priority = $${paramCount}`);
      values.push(body.priority);
      paramCount++;
    }
    
    if (updateFields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `UPDATE maintenance_requests SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);
    
    if (result.length === 0) {
      return Response.json({ error: 'Maintenance request not found' }, { status: 404 });
    }
    
    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    return Response.json({ error: 'Failed to update maintenance request' }, { status: 500 });
  }
}