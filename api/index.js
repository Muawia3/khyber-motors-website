import app from '../backend/app.js';

export default async function handler(req, res) {
  try {
    return app(req, res);
  } catch (error) {
    console.error('Vercel Serverless Invocation Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal Serverless Error',
    });
  }
}
