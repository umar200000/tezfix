module.exports = {
  apps: [
    {
      name: "tezfix-api",
      cwd: "/opt/tezfix/apps/api",
      script: "./dist/index.js",
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      out_file: "/opt/tezfix/logs/api.out.log",
      error_file: "/opt/tezfix/logs/api.err.log",
      merge_logs: true,
      time: true,
    },
  ],
};
