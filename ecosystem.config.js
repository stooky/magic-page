module.exports = {
  apps: [
    {
      name: 'magic-page',
      script: 'npm',
      args: 'start',
      cwd: '~/magic-page/', // Path to your project root
      watch: false, // You can set this to true if you want to enable file watching
      env: {
        NODE_ENV: 'production',
        PORT: 80
      },
    },
  ],
};

