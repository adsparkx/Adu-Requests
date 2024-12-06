module.exports = {
    apps: [
        {
            name: "my-app",
            script: "npm",
            args: "run prod",
            watch: false,
            restart_delay: 5000, // Wait 5 seconds before restarting
            max_memory_restart: "200M", // Restart if memory usage exceeds 200MB
            env: {
                NODE_ENV: "production",
                PORT: 3000, // Let the app dynamically handle ports (see below)
            },
            env_development: {
                NODE_ENV: "development",
                PORT: 3000, // Let the app dynamically handle ports (see below)
            },
            kill_timeout: 1000 * 60 * 5,
        },
        {
            name: "my-app-5000", // Duplicate app for PORT 5000
            script: "npm",
            args: "run prod", // Run the npm command
            watch: false, // Disable file watching
            env: {
                NODE_ENV: "production", // Environment variables for production
                DOMAIN_CRON: "true", // Enable cron jobs
                PORT: 5000, // Set the port for this instance
            },
            env_development: {
                NODE_ENV: "development", // Environment variables for development
                DOMAIN_CRON: "true", // Enable cron jobs
                PORT: 5000, // Set the port for this instance
            },
            kill_timeout: 1000 * 60 * 5, // Time to wait before forcefully killing the process
        },
    ],
};
