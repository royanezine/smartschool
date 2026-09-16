module.exports = {
  apps: [
    {
      name: "smartschool-backend",
      cwd: __dirname,
      script: "dist/server.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};