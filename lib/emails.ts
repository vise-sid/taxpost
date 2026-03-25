export const streakAtRiskEmail = (userName: string, streakDays: number) => ({
  subject: `⚠️ Your ${streakDays}-day streak is at risk!`,
  html: `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #1a237e; padding: 12px 16px; border-radius: 12px;">
          <span style="color: white; font-size: 24px; font-weight: bold;">T</span>
        </div>
      </div>
      <h2 style="color: #1a237e; text-align: center; margin-bottom: 8px;">
        Hey ${userName}! 👋
      </h2>
      <p style="color: #333; text-align: center; font-size: 16px; line-height: 1.5;">
        You haven't practiced today. Your <strong style="color: #ff6d00;">${streakDays}-day streak</strong> is at risk!
      </p>
      <p style="color: #666; text-align: center; font-size: 14px;">
        It only takes 3 minutes to keep it alive.
      </p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://taxpost.in/learn" style="display: inline-block; background: #ff6d00; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Practice Now →
        </a>
      </div>
      <p style="color: #999; text-align: center; font-size: 12px; margin-top: 32px;">
        Taxpost — Master India's Income Tax Act 2025
      </p>
    </div>
  `,
});

export const morningMotivationEmail = (userName: string, streakDays: number) => ({
  subject: `🔥 ${streakDays}-day streak! Keep it going!`,
  html: `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #1a237e; padding: 12px 16px; border-radius: 12px;">
          <span style="color: white; font-size: 24px; font-weight: bold;">T</span>
        </div>
      </div>
      <h2 style="color: #1a237e; text-align: center; margin-bottom: 8px;">
        Good morning, ${userName}! ☀️
      </h2>
      <p style="color: #333; text-align: center; font-size: 16px; line-height: 1.5;">
        You're on a <strong style="color: #ff6d00;">${streakDays}-day streak</strong>. Amazing!
      </p>
      <p style="color: #666; text-align: center; font-size: 14px;">
        Keep mastering the new Income Tax Act — just 3 minutes today.
      </p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://taxpost.in/learn" style="display: inline-block; background: #1a237e; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Start Today's Lesson →
        </a>
      </div>
      <p style="color: #999; text-align: center; font-size: 12px; margin-top: 32px;">
        Taxpost — Master India's Income Tax Act 2025
      </p>
    </div>
  `,
});

export const streakBrokenEmail = (userName: string) => ({
  subject: "Your streak was reset — start fresh today!",
  html: `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #1a237e; padding: 12px 16px; border-radius: 12px;">
          <span style="color: white; font-size: 24px; font-weight: bold;">T</span>
        </div>
      </div>
      <h2 style="color: #1a237e; text-align: center; margin-bottom: 8px;">
        Hey ${userName} 💪
      </h2>
      <p style="color: #333; text-align: center; font-size: 16px; line-height: 1.5;">
        Your streak was reset. No worries — every CA who passes knows that consistency beats perfection.
      </p>
      <p style="color: #666; text-align: center; font-size: 14px;">
        Start a new streak today. The new Act isn't going to learn itself!
      </p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://taxpost.in/learn" style="display: inline-block; background: #ff6d00; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Start Fresh →
        </a>
      </div>
      <p style="color: #999; text-align: center; font-size: 12px; margin-top: 32px;">
        Taxpost — Master India's Income Tax Act 2025
      </p>
    </div>
  `,
});
