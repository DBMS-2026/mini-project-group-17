const jwt = require('jsonwebtoken');

/**
 * Middleware to protect API routes by verifying the custom Nexus Token (JWT).
 * This token is issued after a successful Google Auth 2.0 login.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const protectRoute = (req, res, next) => {
  // 1. Extract the Token from the Authorization header
  const authHeader = req.headers.authorization;

  // 2. Missing Token Handling
  // Expecting format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 3. Verification
    // The jwt.verify function synchronously verifies the token using the secret key.
    // If it's invalid or expired, it throws an error which is caught in the catch block.
    const secretKey = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
    
    if (!secretKey) {
      console.error('[AuthMiddleware] JWT_SECRET_KEY is not defined in environment variables.');
      return res.status(500).json({
        success: false,
        error: 'Internal server error. Authentication configuration missing.',
      });
    }

    const decodedPayload = jwt.verify(token, secretKey);

    // 4. Attach User Payload
    // Attach the decoded payload (e.g., id, email, role) to the request object
    // so subsequent route handlers can access the authenticated user's data.
    req.user = decodedPayload;

    // 5. Success
    // Pass control to the next middleware or actual API route handler
    next();
  } catch (error) {
    // 6. Error Handling
    // Catch tampered, malformed, or expired tokens
    console.error(`[AuthMiddleware] Token verification failed: ${error.message}`);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired session token.',
    });
  }
};

module.exports = {
  protectRoute,
};
