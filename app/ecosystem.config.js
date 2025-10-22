module.exports = {
  apps: [
    {
      name: "eventapp",
      script: "server.js",
      cwd: __dirname,
      env: { PORT: 3000 }
    }
  ]
};
