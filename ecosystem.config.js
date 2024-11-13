module.exports = {
    apps: [
        {
            name: "my-app", // Name of your app
            script: "index.js", // Script to run
            instances: 2, // Number of instances (processes)
            exec_mode: "cluster", // Run in cluster mode
            watch: false, // Disable file watching
            env: {
                NODE_ENV: "production", // Environment variables for production
            },
            env_development: {
                NODE_ENV: "development", // Environment variables for development
            },
        },
    ],
};
