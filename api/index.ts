import app from '../server';

/**
 * Vercel Serverless Function entry point
 * Handles requests to /api, /api/v1, and rewrites.
 */
export default async function handler(req: any, res: any) {
  // 1. Standard CORS and Security Headers for Vercel Serverless
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-API-Key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 2. Delegate to the Express application
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Function Invocation Error]:', err);
    return res.status(500).json({
      error: 'FUNCTION_INVOCATION_RECOVERED',
      message: err?.message || 'Server error occurred inside serverless handler'
    });
  }
}
