module.exports = {
  apps: [
    {
      name: 'travel-agency-backend',
      script: 'backend/server.js',
      cwd: '/home/ec2-user/travel-agency', 
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        APPWRITE_ENDPOINT: 'https://fra.cloud.appwrite.io/v1',
        APPWRITE_PROJECT_ID: '6830c3910019c5a7c26c',
        APPWRITE_API_KEY: 'standard_cdfdc8ec670b42d6db6e3705afcad05c7fda2decc185cce99a9d284d1288db824d5ed4e865399f2de2fe3a1868f23064e6ea719da9cefe255a84da7c4833621dea4474bf175bacc34ec95a60ddef102bb05c79dc30e5b8edf8e68478a346b5d4349f124699f17cf5d42b05293fee9e2fb0cef06fb8029327dae77eede9eccec8',
        APPWRITE_DATABASE_ID: '6833729d000843f2772d',
        APPWRITE_USERS_COLLECTION_ID: '68337361001be503b599',
        APPWRITE_TRIPS_COLLECTION_ID: '683373de0035b47b77a1',
        GEMINI_API_KEY: 'AIzaSyDbN9z0D3YLjwNlxYqJpxRZuCcOSG-Rt-4',
        UNSPLASH_ACCESS_KEY: '7Wes8OV0l04JQ-0fHV-baVhsgPznLzi4_lHhrxSMQ-Y',
        FRONTEND_URL: 'http://3.129.92.159:3000'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'travel-agency-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/ec2-user/travel-agency', 
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      interpreter: 'none'
    }
  ]
};
