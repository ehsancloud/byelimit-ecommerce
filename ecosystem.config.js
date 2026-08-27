module.exports = {
  apps: [
    {
      name: "byelimit-backend",
      cwd: "/var/www/byelimit/Backend",
      script: "src/server.js",
      env: { NODE_ENV: "production" },
    },
    {
      name: "byelimit-worker",
      cwd: "/var/www/byelimit/Backend",
      script: "src/jobs/worker.js",
      env: { NODE_ENV: "production" },
    },
    {
      name: "byelimit-frontend",
      cwd: "/var/www/byelimit/Frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: { NODE_ENV: "production" },
    },
    {
      name: "byelimit-studio",
      cwd: "/var/www/byelimit/Backend",
      script: "npx",
      args: "prisma studio --port 5555 --browser none",
      env: { NODE_ENV: "production" },
    },
  ],
};
