// Standardized response formatters

export function successResponse(data, count = null) {
  const response = {
    success: true,
    data
  };
  
  if (count !== null) {
    response.count = count;
  }
  
  return response;
}

export function errorResponse(message, errors = null) {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
}

export function paginatedResponse(data, total, limit, offset) {
  return {
    success: true,
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + data.length < total
    }
  };
}
