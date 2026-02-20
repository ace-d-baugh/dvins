const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: err.errors 
    });
  }

  if (err.name === 'DatabaseError') {
    return res.status(500).json({ 
      error: 'Database error', 
      details: err.message 
    });
  }

  if (err.name === 'AuthenticationError') {
    return res.status(401).json({ 
      error: 'Authentication error', 
      details: err.message 
    });
  }

  if (err.name === 'AuthorizationError') {
    return res.status(403).json({ 
      error: 'Authorization error', 
      details: err.message 
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({ 
      error: 'Not found', 
      details: err.message 
    });
  }

  // Default error response
  res.status(500).json({ 
    error: 'Internal server error', 
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' 
  });
};

module.exports = errorHandler;
