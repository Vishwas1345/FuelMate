import Analytics from '../models/Analytics.js';
import Order from '../models/Order.js';
import redis from '../lib/redis.js';
import logger from '../utils/logger.js';

const ANALYTICS_TTL_SECONDS = 5 * 60; // 5 minutes

// Redis key helpers
const analyticsKey = (userId) => `analytics:${userId}`;

class AnalyticsController {
    async getSummary(req, res) {
        try {
            const userId = req.user._id.toString();
            const role = req.user.role;
            const cacheKey = analyticsKey(userId);

            // ── 1. Try Redis cache first ──────────────────────────────────────
            try {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    logger.debug('Analytics cache hit', { userId });
                    return res.json(JSON.parse(cached));
                }
            } catch (redisErr) {
                // Redis unavailable — fall through to MongoDB, don't crash
                logger.warn('Redis unavailable for analytics read, falling back to DB', {
                    error: redisErr.message,
                });
            }

            // ── 2. Cache miss — aggregate from MongoDB ────────────────────────
            logger.debug('Analytics cache miss — aggregating from DB', { userId });
            const stats = await this.aggregateAnalytics(userId, role);

            // Upsert into Analytics collection for persistence
            const analytics = await Analytics.findOneAndUpdate(
                { userId },
                { ...stats, userId, role, lastUpdated: new Date() },
                { upsert: true, new: true }
            );

            // ── 3. Populate cache for next request ────────────────────────────
            try {
                await redis.set(cacheKey, JSON.stringify(analytics), 'EX', ANALYTICS_TTL_SECONDS);
                logger.debug('Analytics cached in Redis', { userId, ttl: ANALYTICS_TTL_SECONDS });
            } catch (redisErr) {
                logger.warn('Redis unavailable for analytics write', { error: redisErr.message });
            }

            res.json(analytics);
        } catch (error) {
            logger.error('Analytics Fetch Error:', { error: error.message, stack: error.stack });
            res.status(500).json({ message: 'Error retrieving operational telemetry.' });
        }
    }

    async aggregateAnalytics(userId, role) {
        const query = role === 'station' ? { stationId: userId } : { userId };
        const orders = await Order.find({ ...query, status: 'delivered' }).sort({ createdAt: 1 });

        const totalFuel = orders.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const totalAmount = orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        const petrolVolume = orders
            .filter(o => o.fuelType === 'Petrol')
            .reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const dieselVolume = orders
            .filter(o => o.fuelType === 'Diesel')
            .reduce((acc, curr) => acc + (curr.quantity || 0), 0);

        // Daily trends (last 30 delivered orders)
        const dailyTrendsMap = {};
        orders.slice(-30).forEach(order => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            if (!dailyTrendsMap[date]) {
                dailyTrendsMap[date] = { date, quantity: 0, amount: 0 };
            }
            dailyTrendsMap[date].quantity += order.quantity;
            dailyTrendsMap[date].amount += order.totalPrice;
        });

        // Monthly trends
        const monthlyTrendsMap = {};
        orders.forEach(order => {
            const month = new Date(order.createdAt).toISOString().slice(0, 7); // YYYY-MM
            if (!monthlyTrendsMap[month]) {
                monthlyTrendsMap[month] = { month, quantity: 0, amount: 0 };
            }
            monthlyTrendsMap[month].quantity += order.quantity;
            monthlyTrendsMap[month].amount += order.totalPrice;
        });

        return {
            totalFuel,
            totalAmount,
            fuelTypeBreakdown: { petrol: petrolVolume, diesel: dieselVolume },
            dailyTrends: Object.values(dailyTrendsMap).sort((a, b) => a.date.localeCompare(b.date)),
            monthlyTrends: Object.values(monthlyTrendsMap).sort((a, b) => a.month.localeCompare(b.month)),
        };
    }
}

/**
 * Invalidate the analytics cache for a given user/station.
 * Called from orderService when an order is marked as delivered.
 */
export const invalidateAnalyticsCache = async (userId) => {
    try {
        await redis.del(analyticsKey(userId.toString()));
        logger.debug('Analytics cache invalidated', { userId });
    } catch (err) {
        logger.warn('Could not invalidate analytics cache', { userId, error: err.message });
    }
};

export default new AnalyticsController();
