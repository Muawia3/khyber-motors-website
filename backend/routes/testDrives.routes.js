import express from 'express';
const router = express.Router();

router.get('/', (_req, res) => res.json({ success: true, data: [] }));
router.post('/', (_req, res) => res.json({ success: true, message: 'Received' }));

export default router;
