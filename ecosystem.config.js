module.exports = {
    apps: [
        {
            name: "my-app", // Name of your app
            script: "npm",
            args: "run prod", // Run the npm command
            watch: false, // Disable file watching
            env: {
                NODE_ENV: "production", // Environment variables for production
            },
            env_development: {
                NODE_ENV: "development", // Environment variables for development
            },
            kill_timeout: 1000 * 60 * 5, // Time to wait before
        },
    ],
};
