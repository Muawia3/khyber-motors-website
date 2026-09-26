import express from 'express';
import prisma from '../config/db.js';

const router = express.Router();

// 1. POST /api/analytics/track - Track public page view
router.post('/track', async (req, res) => {
  try {
    const { path, visitorId } = req.body;

    if (!path || typeof path !== 'string' || !visitorId || typeof visitorId !== 'string') {
      return res.status(400).json({ success: false, error: 'Path and visitorId are required' });
    }

    // Do NOT track Admin routes or API routes
    const cleanPath = path.trim().toLowerCase();
    if (cleanPath.startsWith('/admin') || cleanPath.startsWith('/api')) {
      return res.json({ success: true, tracked: false, reason: 'Admin or API path ignored' });
    }

    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
    const userAgent = (req.headers['user-agent'] || '').toString();

    const record = await prisma.pageView.create({
      data: {
        path: path.trim(),
        visitorId: visitorId.trim(),
        ipAddress: ipAddress || null,
        userAgent: userAgent ? userAgent.substring(0, 500) : null,
      },
    });

    res.json({ success: true, tracked: true, id: record.id });
  } catch (err) {
    console.error('Analytics tracking error:', err);
    res.status(500).json({ success: false, error: err.message || 'Tracking failed' });
  }
});

// 2. GET /api/analytics/stats - Retrieve real website analytics metrics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const now = new Date();

    // Start of Today (local time)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // 7 Days Ago
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 30 Days Ago
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Query database for all page views
    const [
      allPageViews,
      todayPageViews,
      weekPageViews,
      monthPageViews,
    ] = await Promise.all([
      prisma.pageView.findMany({ select: { visitorId: true, path: true, createdAt: true } }),
      prisma.pageView.findMany({ where: { createdAt: { gte: startOfToday } }, select: { visitorId: true } }),
      prisma.pageView.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { visitorId: true } }),
      prisma.pageView.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { visitorId: true } }),
    ]);

    // Unique Visitors Calculations
    const totalUniqueVisitors = new Set(allPageViews.map((pv) => pv.visitorId)).size;
    const visitorsToday = new Set(todayPageViews.map((pv) => pv.visitorId)).size;
    const visitorsThisWeek = new Set(weekPageViews.map((pv) => pv.visitorId)).size;
    const visitorsThisMonth = new Set(monthPageViews.map((pv) => pv.visitorId)).size;

    const totalPageViews = allPageViews.length;
    const pageViewsToday = todayPageViews.length;

    // Most Visited Pages Aggregation
    const pageCounts = {};
    allPageViews.forEach((pv) => {
      const p = pv.path || '/';
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });

    const mostVisitedPages = Object.entries(pageCounts)
      .map(([pathStr, count]) => ({
        path: pathStr,
        count,
        percentage: totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Date Range filtering for Daily Visitors History
    let rangeStart = startDate ? new Date(startDate) : new Date(now);
    let rangeEnd = endDate ? new Date(endDate) : new Date(now);

    if (isNaN(rangeStart.getTime())) {
      rangeStart = new Date(now);
      rangeStart.setDate(rangeStart.getDate() - 6);
    }
    if (isNaN(rangeEnd.getTime())) {
      rangeEnd = new Date(now);
    }

    // Standardize to start and end of days
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);

    if (rangeStart > rangeEnd) {
      const temp = rangeStart;
      rangeStart = rangeEnd;
      rangeEnd = temp;
    }

    // Build day-by-day array for date range
    const dailyHistoryMap = {};
    const currentDateCursor = new Date(rangeStart);
    while (currentDateCursor <= rangeEnd) {
      const dateStr = currentDateCursor.toISOString().split('T')[0];
      dailyHistoryMap[dateStr] = { date: dateStr, visitors: new Set(), pageViews: 0 };
      currentDateCursor.setDate(currentDateCursor.getDate() + 1);
    }

    // Populate actual database page view records into daily buckets
    allPageViews.forEach((pv) => {
      if (pv.createdAt >= rangeStart && pv.createdAt <= rangeEnd) {
        const dateStr = pv.createdAt.toISOString().split('T')[0];
        if (dailyHistoryMap[dateStr]) {
          dailyHistoryMap[dateStr].visitors.add(pv.visitorId);
          dailyHistoryMap[dateStr].pageViews += 1;
        }
      }
    });

    const dailyHistory = Object.values(dailyHistoryMap).map((d) => ({
      date: d.date,
      visitors: d.visitors.size,
      pageViews: d.pageViews,
    }));

    res.json({
      success: true,
      data: {
        visitorsToday,
        visitorsThisWeek,
        visitorsThisMonth,
        totalUniqueVisitors,
        pageViewsToday,
        totalPageViews,
        mostVisitedPages,
        dailyHistory,
        dateRange: {
          startDate: rangeStart.toISOString().split('T')[0],
          endDate: rangeEnd.toISOString().split('T')[0],
        },
      },
    });
  } catch (err) {
    console.error('Analytics stats error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch analytics' });
  }
});

export default router;
