import type { VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
	trailingSlash: false,
	crons: [
		{
			path: "/api/cron/reminders",
			schedule: "30 14 * * *", // 8:00 PM IST
		},
	],
};
