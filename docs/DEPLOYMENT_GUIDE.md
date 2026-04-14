# Blood Suite - Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [SSL Configuration](#ssl-configuration)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Security Configuration](#security-configuration)
10. [Backup and Recovery](#backup-and-recovery)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides comprehensive instructions for deploying the Blood Suite blood bank management system in a production environment. The deployment covers backend services, frontend application, database configuration, and security considerations.

### Deployment Architecture
```
Internet
    |
    v
Load Balancer (SSL Termination)
    |
    v
Web Server (Nginx) --> Frontend (React Build)
    |
    v
Application Server (Node.js) --> Backend API
    |
    v
Database Server (PostgreSQL)
```

### Target Environments
- **Production**: Live environment for end users
- **Staging**: Pre-production testing environment
- **Development**: Development and testing environment

---

## Prerequisites

### System Requirements

#### Minimum Hardware Specifications
- **CPU**: 2 cores (4 cores recommended)
- **RAM**: 4GB (8GB recommended)
- **Storage**: 50GB SSD (100GB recommended)
- **Network**: 100 Mbps (1 Gbps recommended)

#### Software Requirements
- **Operating System**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **Node.js**: 16.x or higher
- **PostgreSQL**: 12.x or higher
- **Nginx**: 1.18 or higher
- **PM2**: Latest version
- **Git**: 2.x or higher

#### Network Requirements
- **Ports**: 80 (HTTP), 443 (HTTPS), 22 (SSH)
- **Firewall**: Properly configured firewall rules
- **Domain**: Registered domain name with DNS configuration

---

## Environment Setup

### Server Preparation

#### 1. Update System Packages
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### 2. Install Required Software
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

#### 3. Create Application User
```bash
# Create dedicated user for the application
sudo adduser bloodsuite
sudo usermod -aG sudo bloodsuite

# Switch to application user
sudo su - bloodsuite
```

### Application Setup

#### 1. Clone Repository
```bash
git clone https://github.com/Tsosane/-bloodsuite_project.git
cd Blood_suite
```

#### 2. Backend Setup
```bash
cd backend
npm install --production
cp .env.example .env
```

#### 3. Frontend Build
```bash
cd ../frontend-web
npm install
npm run build
```

---

## Database Setup

### PostgreSQL Configuration

#### 1. Database Creation
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE blood_suite_prod;
CREATE USER bloodsuite_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE blood_suite_prod TO bloodsuite_user;
\q
```

#### 2. Configure PostgreSQL
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/12/main/postgresql.conf

# Update these settings:
listen_addresses = 'localhost'
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB

# Edit pg_hba.conf for secure connections
sudo nano /etc/postgresql/12/main/pg_hba.conf

# Add this line for local connections:
local   blood_suite_prod   bloodsuite_user   md5
```

#### 3. Restart PostgreSQL
```bash
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

#### 4. Run Database Migrations
```bash
cd /home/bloodsuite/Blood_suite/backend
npm run migrate
```

#### 5. Seed Initial Data (Optional)
```bash
npm run seed
```

---

## Backend Deployment

### Environment Configuration

#### 1. Production Environment Variables
Create `.env` file in backend directory:
```env
# Database Configuration
DB_NAME=blood_suite_prod
DB_USER=bloodsuite_user
DB_PASSWORD=secure_password_here
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_production_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Security Configuration
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/bloodsuite/app.log
```

### PM2 Configuration

#### 1. Create PM2 Configuration File
```bash
cd /home/bloodsuite/Blood_suite/backend
nano ecosystem.config.js
```

#### 2. PM2 Configuration Content
```javascript
module.exports = {
  apps: [{
    name: 'bloodsuite-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/bloodsuite/error.log',
    out_file: '/var/log/bloodsuite/out.log',
    log_file: '/var/log/bloodsuite/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

#### 3. Start Application with PM2
```bash
# Create log directory
sudo mkdir -p /var/log/bloodsuite
sudo chown bloodsuite:bloodsuite /var/log/bloodsuite

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Nginx Configuration

#### 1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/bloodsuite
```

#### 2. Nginx Configuration Content
```nginx
# Backend API Server
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

#### 3. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/bloodsuite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Frontend Deployment

### Build Configuration

#### 1. Production Build
```bash
cd /home/bloodsuite/Blood_suite/frontend-web

# Create production environment file
nano .env.production
```

#### 2. Frontend Environment Variables
```env
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

#### 3. Build Application
```bash
npm run build
```

### Nginx Frontend Configuration

#### 1. Create Frontend Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/bloodsuite-frontend
```

#### 2. Frontend Configuration Content
```nginx
# Frontend Application
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /home/bloodsuite/Blood_suite/frontend-web/build;
    index index.html index.htm;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' https://api.your-domain.com" always;
}
```

#### 3. Enable Frontend Site
```bash
sudo ln -s /etc/nginx/sites-available/bloodsuite-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL Configuration

### Let's Encrypt SSL Certificate

#### 1. Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 2. Obtain SSL Certificate
```bash
# For frontend
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# For API
sudo certbot --nginx -d api.your-domain.com
```

#### 3. Auto-Renewal Setup
```bash
sudo crontab -e
# Add this line for automatic renewal:
0 12 * * * /usr/bin/certbot renew --quiet
```

#### 4. Verify SSL Configuration
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Security Configuration

#### 1. Enhanced SSL Settings
Add to your Nginx configuration:
```nginx
# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# HSTS (HTTP Strict Transport Security)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## Monitoring and Logging

### Application Monitoring

#### 1. PM2 Monitoring
```bash
# Monitor application status
pm2 monit

# View logs
pm2 logs

# View application metrics
pm2 show bloodsuite-api
```

#### 2. System Monitoring Setup
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Create monitoring script
nano /home/bloodsuite/monitor.sh
```

#### 3. Monitoring Script
```bash
#!/bin/bash
# System monitoring script
echo "=== System Status ===" >> /var/log/bloodsuite/monitor.log
date >> /var/log/bloodsuite/monitor.log
echo "CPU Usage:" >> /var/log/bloodsuite/monitor.log
top -bn1 | grep "Cpu(s)" >> /var/log/bloodsuite/monitor.log
echo "Memory Usage:" >> /var/log/bloodsuite/monitor.log
free -h >> /var/log/bloodsuite/monitor.log
echo "Disk Usage:" >> /var/log/bloodsuite/monitor.log
df -h >> /var/log/bloodsuite/monitor.log
echo "=== Application Status ===" >> /var/log/bloodsuite/monitor.log
pm2 status >> /var/log/bloodsuite/monitor.log
echo "" >> /var/log/bloodsuite/monitor.log
```

#### 4. Setup Cron Job for Monitoring
```bash
sudo crontab -e
# Add monitoring job:
*/5 * * * * /home/bloodsuite/monitor.sh
```

### Log Management

#### 1. Log Rotation Setup
```bash
sudo nano /etc/logrotate.d/bloodsuite
```

#### 2. Log Rotation Configuration
```
/var/log/bloodsuite/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 bloodsuite bloodsuite
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## Security Configuration

### Firewall Setup

#### 1. UFW Configuration
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow PostgreSQL (if remote access needed)
sudo ufw allow 5432

# Check firewall status
sudo ufw status
```

### Application Security

#### 1. File Permissions
```bash
# Set proper file permissions
sudo chmod -R 755 /home/bloodsuite/Blood_suite
sudo chmod -R 644 /home/bloodsuite/Blood_suite/frontend-web/build
sudo chmod 600 /home/bloodsuite/Blood_suite/backend/.env
```

#### 2. Security Headers
Ensure your Nginx configuration includes:
```nginx
# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Database Security

#### 1. PostgreSQL Security
```bash
# Restrict PostgreSQL connections
sudo nano /etc/postgresql/12/main/pg_hba.conf

# Ensure only secure connections are allowed
# Remove unnecessary trust connections
```

#### 2. Regular Security Updates
```bash
# Set up automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Backup and Recovery

### Database Backup

#### 1. Backup Script
```bash
nano /home/bloodsuite/backup-db.sh
```

#### 2. Backup Script Content
```bash
#!/bin/bash
# Database backup script
BACKUP_DIR="/home/bloodsuite/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="blood_suite_prod"
DB_USER="bloodsuite_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

#### 3. Setup Automated Backups
```bash
# Make script executable
chmod +x /home/bloodsuite/backup-db.sh

# Add to crontab for daily backups at 2 AM
sudo crontab -e
0 2 * * * /home/bloodsuite/backup-db.sh
```

### Application Backup

#### 1. Application Backup Script
```bash
nano /home/bloodsuite/backup-app.sh
```

#### 2. Application Backup Content
```bash
#!/bin/bash
# Application backup script
BACKUP_DIR="/home/bloodsuite/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/bloodsuite/Blood_suite"

# Create application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz $APP_DIR

# Remove backups older than 7 days
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "Application backup completed: app_backup_$DATE.tar.gz"
```

### Recovery Procedures

#### 1. Database Recovery
```bash
# Restore database from backup
gunzip backup_YYYYMMDD_HHMMSS.sql.gz
psql -U bloodsuite_user -h localhost blood_suite_prod < backup_YYYYMMDD_HHMMSS.sql
```

#### 2. Application Recovery
```bash
# Restore application from backup
tar -xzf app_backup_YYYYMMDD_HHMMSS.tar.gz
# Restart services
pm2 restart bloodsuite-api
sudo systemctl restart nginx
```

---

## Performance Optimization

### Database Optimization

#### 1. PostgreSQL Performance Tuning
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/12/main/postgresql.conf

# Optimize settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### 2. Database Indexing
```sql
-- Create indexes for better performance
CREATE INDEX idx_donors_blood_type ON donors(blood_type);
CREATE INDEX idx_inventory_blood_type ON blood_inventory(blood_type);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_hospital_id ON requests(hospital_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
```

### Application Performance

#### 1. Node.js Optimization
```javascript
// Add to your server.js
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Start application
  require('./src/app');
}
```

#### 2. Caching Strategy
```javascript
// Implement Redis caching (optional)
const redis = require('redis');
const client = redis.createClient();

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

### Nginx Optimization

#### 1. Nginx Performance Tuning
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Enable caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs bloodsuite-api

# Check configuration
pm2 show bloodsuite-api

# Restart application
pm2 restart bloodsuite-api
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U bloodsuite_user -h localhost -d blood_suite_prod

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-12-main.log
```

#### 3. Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout
```

### Performance Issues

#### 1. High CPU Usage
```bash
# Check CPU usage
top
htop

# Check Node.js processes
ps aux | grep node

# Monitor PM2 processes
pm2 monit
```

#### 2. High Memory Usage
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Monitor Node.js memory
pm2 show bloodsuite-api
```

#### 3. Database Performance
```bash
# Check active connections
psql -U bloodsuite_user -h localhost -d blood_suite_prod -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
psql -U bloodsuite_user -h localhost -d blood_suite_prod -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Emergency Procedures

#### 1. Application Down
```bash
# Quick restart
pm2 restart bloodsuite-api
sudo systemctl restart nginx

# If still down, check logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

#### 2. Database Down
```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Check for corruption
sudo -u postgres pg_dump blood_suite_prod > /dev/null
```

#### 3. Full System Recovery
```bash
# Restore from latest backup
cd /home/bloodsuite/backups
latest_db=$(ls -t backup_*.sql.gz | head -1)
gunzip $latest_db
psql -U bloodsuite_user -h localhost blood_suite_prod < ${latest_db%.gz}

# Restart all services
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

---

## Maintenance Tasks

### Daily Tasks
- Check application logs for errors
- Monitor system performance metrics
- Verify backup completion
- Check SSL certificate status

### Weekly Tasks
- Review system security updates
- Analyze performance trends
- Check database size and growth
- Review user activity logs

### Monthly Tasks
- Apply security patches
- Update application dependencies
- Review and optimize database queries
- Test backup and recovery procedures

### Quarterly Tasks
- Security audit and penetration testing
- Performance optimization review
- Capacity planning assessment
- Documentation updates

---

## Support and Monitoring

### Monitoring Dashboard
Set up monitoring dashboards to track:
- Application uptime and response times
- Database performance metrics
- System resource utilization
- Error rates and patterns

### Alert Configuration
Configure alerts for:
- Application downtime
- High error rates
- Performance degradation
- Security events
- Backup failures

### Contact Information
- **Technical Support**: support@bloodsuite.org
- **Emergency Contact**: emergency@bloodsuite.org
- **Documentation**: https://docs.bloodsuite.org

---

*Last Updated: April 2026*
*Version: 1.0.0*
