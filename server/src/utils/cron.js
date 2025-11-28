const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendMail } = require('./mailer');

const initCronJobs = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        console.log('Running hourly task reminder check...');
        try {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

            // Find tasks due or set to notify within the next hour
            // We check for tasks where (notifyAt is between now and 1h later) OR (dueAt is between now and 1h later AND notifyAt is not set)
            const tasks = await Task.find({
                status: { $ne: 'completed' },
                $or: [
                    { notifyAt: { $gte: now, $lt: oneHourLater } },
                    { dueAt: { $gte: now, $lt: oneHourLater }, notifyAt: { $exists: false } }
                ]
            }).populate('userId', 'email username settings');

            for (const task of tasks) {
                const user = task.userId;
                if (!user || !user.email || (user.settings && user.settings.notificationsEnabled === false)) continue;

                console.log(`Sending reminder for task "${task.title}" to ${user.email}`);

                await sendMail({
                    to: user.email,
                    subject: `Reminder: ${task.title} is due soon!`,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563EB;">Task Reminder</h2>
              <p>Hi ${user.username},</p>
              <p>This is a friendly reminder that the following task is coming up:</p>
              <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0;">${task.title}</h3>
                <p style="margin: 0; color: #4B5563;">${task.description || 'No description'}</p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #6B7280;">
                  Due: ${new Date(task.dueAt).toLocaleString()}
                </p>
              </div>
              <p>Good luck getting it done!</p>
              <p style="font-size: 12px; color: #9CA3AF;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Open Dashboard</a>
              </p>
            </div>
          `
                });
            }
        } catch (err) {
            console.error('Error in cron job:', err);
        }
    });

    console.log('Cron jobs initialized');
};

module.exports = initCronJobs;
