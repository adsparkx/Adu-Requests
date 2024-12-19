module.exports = {
    apps: [
        // {
        //     name: "my-app",
        //     script: "npm",
        //     args: "run prod", // Correctly pass arguments
        //     instances: 4,
        //     exec_mode: "cluster", // Cluster mode
        //     watch: false,
        //     restart_delay: 5000,
        //     env: {
        //         NODE_ENV: "production",
        //     },
        //     env_development: {
        //         NODE_ENV: "development",
        //     },
        //     kill_timeout: 1000 * 60 * 5,
        // },
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
