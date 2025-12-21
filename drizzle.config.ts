import 'dotenv/config';

export default {
  schema: './src/models/*.ts',
  output: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
