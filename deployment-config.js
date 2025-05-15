/**
 * Ghantaa Time Tracking App - Deployment Configuration
 *
 * This file contains configuration settings for different deployment environments.
 */

const config = {
  development: {
    apiUrl: "http://localhost:3000",
    debugMode: true,
    sessionDuration: 4 * 60 * 60, // 4 hours in seconds
  },
  production: {
    apiUrl: "https://ghantaa-time-tracking.vercel.app", // Replace with your actual domain
    debugMode: false,
    sessionDuration: 4 * 60 * 60, // 4 hours in seconds
  },
  test: {
    apiUrl: "http://localhost:3000",
    debugMode: true,
    sessionDuration: 30 * 60, // 30 minutes in seconds for testing
  },
}

// Determine current environment
const environment = process.env.NODE_ENV || "development"

// Export the configuration for the current environment
module.exports = config[environment]
