import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // We add a fallback or ensure the variable is pulled correctly
    url: 'postgresql://postgres:admin@localhost:3000/url_shortener', 
  },
});