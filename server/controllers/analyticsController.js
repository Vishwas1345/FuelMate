import Analytics from '../models/Analytics.js';
import Order from '../models/Order.js';

class AnalyticsController {
    async getSummary(req, res) {
        try {
            const userId = req.user._id;
            const role = req.user.role;

            // Find existing analytics or refresh
            let analytics = await Analytics.findOne({ userId });

            // For now, let's always recalculate to ensure real-time accuracy since the user said "it doesn't work"
            // In a large app, we would use a cached/precomputed version and a trigger.
            const stats = await this.aggregateAnalytics(userId, role);

            // Upsert the results for persistence
            analytics = await Analytics.findOneAndUpdate(
                { userId },
                { ...stats, userId, role, lastUpdated: new Date() },
                { upsert: true, new: true }
            );

            res.json(analytics);
        } catch (error) {
            console.error('Analytics Fetch Error:', error);
            res.status(500).json({ message: 'Error retrieving operational telemetry.' });
        }
    }

    async aggregateAnalytics(userId, role) {
        // Query filter based on role
        const query = role === 'station' ? { stationId: userId } : { userId };
        const orders = await Order.find({ ...query, status: 'delivered' }).sort({ createdAt: 1 });

        const totalFuel = orders.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const totalAmount = orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        const petrolVolume = orders.filter(o => o.fuelType === 'Petrol').reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const dieselVolume = orders.filter(o => o.fuelType === 'Diesel').reduce((acc, curr) => acc + (curr.quantity || 0), 0);

        // Daily trends (last 30 orders/days)
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
            monthlyTrends: Object.values(monthlyTrendsMap).sort((a, b) => a.month.localeCompare(b.month))
        };
    }
}

export default new AnalyticsController();
