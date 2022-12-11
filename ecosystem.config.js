module.exports = {
    apps: [
        {
            name: 'mist-stability',
            script: './dist/main.js',
            instances: 'max',
            exec_mode: 'cluster',
        },
    ],
};
