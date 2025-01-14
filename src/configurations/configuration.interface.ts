export interface EnvVariables {
  ENV: string;

  URL: string;
  PORT: number;

  API_KEY: string;

  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_AUTH_USER: string;
  MAIL_AUTH_PWD: string;
  MAIL_FROM: string;
  JWT_SECRET: string;

  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}
