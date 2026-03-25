// This file is needed to support autocomplete for process.env
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // neon db uri
      DATABASE_URL: string;

      // public app url
      NEXT_PUBLIC_APP_URL: string;

      // clerk admin user id(s)
      CLERK_ADMIN_IDS: string;

      // resend api key
      RESEND_API_KEY: string;
    }
  }
}
