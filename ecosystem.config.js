module.exports = {
    apps: [
        {
            name: 'mist-stability',
            script: './dist/main.js',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                PORT: 3000,
                NODE_ENV: 'development',
            },
            env_production: {
                PORT: 3005,
                NODE_ENV: 'production',
            },
        },
    ],
};
