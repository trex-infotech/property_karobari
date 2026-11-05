
module.exports = {
  apps: [
    {
      name: 'propertykarobari',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3033',
      cwd: '/home/ftpuser/files/clients/propertykarobari',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
