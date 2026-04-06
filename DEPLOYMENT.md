# 🚀 Deployment Guide - Mierae Solar Sales Chatbot

Complete step-by-step deployment instructions for various platforms.

## Prerequisites

Before deploying, ensure you have:
- Node.js 16+ installed
- OpenAI or Anthropic API key
- Git installed
- Access to a hosting platform

---

## 🏠 Local Development Deployment

### Step 1: Install Dependencies

```bash
cd solar-sales-bot
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=sk-your-actual-key-here
LLM_PROVIDER=openai
OPENAI_MODEL=gpt-4
PORT=3000
```

### Step 3: Start Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### Step 4: Access Application

- Web Interface: http://localhost:3000
- API Health: http://localhost:3000/api/health
- Lead Stats: http://localhost:3000/api/leads/stats

---

## ☁️ Cloud Deployment

## Option 1: Heroku (Easiest)

### Step 1: Install Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh

# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Create Heroku App

```bash
cd solar-sales-bot
heroku create mierae-solar-bot
```

### Step 4: Set Environment Variables

```bash
heroku config:set OPENAI_API_KEY=sk-your-key-here
heroku config:set LLM_PROVIDER=openai
heroku config:set OPENAI_MODEL=gpt-4
heroku config:set NODE_ENV=production
```

### Step 5: Deploy

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Step 6: Open App

```bash
heroku open
```

### View Logs

```bash
heroku logs --tail
```

---

## Option 2: Digital Ocean App Platform

### Step 1: Create Digital Ocean Account

Sign up at: https://www.digitalocean.com

### Step 2: Create New App

1. Go to App Platform
2. Click "Create App"
3. Connect your GitHub repository
4. Select branch: `main`

### Step 3: Configure App

**Build Command:**
```bash
npm install
```

**Run Command:**
```bash
npm start
```

### Step 4: Set Environment Variables

In App Platform dashboard:
- Add `OPENAI_API_KEY`
- Add `LLM_PROVIDER=openai`
- Add `OPENAI_MODEL=gpt-4`
- Add `NODE_ENV=production`

### Step 5: Deploy

Click "Create Resources" and wait for deployment.

---

## Option 3: AWS EC2

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. Launch Ubuntu 22.04 LTS instance
3. Select t2.small or larger
4. Configure security group: Allow port 3000

### Step 2: Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### Step 4: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/your-repo/solar-sales-bot.git
cd solar-sales-bot
```

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Configure Environment

```bash
nano .env
```

Add your configuration:
```env
OPENAI_API_KEY=sk-your-key-here
LLM_PROVIDER=openai
OPENAI_MODEL=gpt-4
PORT=3000
NODE_ENV=production
```

### Step 7: Start with PM2

```bash
pm2 start src/server.js --name solar-bot
pm2 save
pm2 startup
```

### Step 8: Configure Nginx (Optional)

```bash
sudo apt install nginx

sudo nano /etc/nginx/sites-available/solar-bot
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/solar-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 9: Access Application

Visit: http://your-ec2-ip:3000 or http://your-domain.com

---

## Option 4: Docker Deployment

### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Create .dockerignore

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
data/*.json
```

### Step 3: Build Image

```bash
docker build -t mierae-solar-bot .
```

### Step 4: Run Container

```bash
docker run -d \
  -p 3000:3000 \
  --name solar-bot \
  -e OPENAI_API_KEY=sk-your-key-here \
  -e LLM_PROVIDER=openai \
  -e OPENAI_MODEL=gpt-4 \
  -e NODE_ENV=production \
  -v $(pwd)/data:/app/data \
  mierae-solar-bot
```

### Step 5: View Logs

```bash
docker logs -f solar-bot
```

### Docker Compose (Alternative)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  solar-bot:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - LLM_PROVIDER=openai
      - OPENAI_MODEL=gpt-4
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

---

## Option 5: Google Cloud Platform (GCP)

### Using Cloud Run

### Step 1: Install gcloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Ubuntu
curl https://sdk.cloud.google.com | bash
```

### Step 2: Login and Setup

```bash
gcloud auth login
gcloud config set project your-project-id
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy solar-bot \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=sk-your-key,LLM_PROVIDER=openai
```

---

## 🔒 Production Checklist

Before going live, ensure:

- [ ] **API Keys Secured**: Never commit .env to git
- [ ] **HTTPS Enabled**: Use SSL certificate
- [ ] **Rate Limiting**: Add rate limiting middleware
- [ ] **Monitoring**: Set up logging and alerts
- [ ] **Backup**: Configure automatic backup for leads.json
- [ ] **Error Handling**: Test error scenarios
- [ ] **Load Testing**: Test with multiple concurrent users
- [ ] **Documentation**: Update API docs with production URL
- [ ] **Domain**: Point custom domain to deployment
- [ ] **Analytics**: Enable conversation logging if needed

---

## 🔧 Post-Deployment Configuration

### 1. Test API Endpoints

```bash
# Health check
curl https://your-domain.com/api/health

# Start conversation
curl -X POST https://your-domain.com/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{"language": "hindi"}'
```

### 2. Monitor Logs

**Heroku:**
```bash
heroku logs --tail
```

**PM2 on EC2:**
```bash
pm2 logs solar-bot
```

**Docker:**
```bash
docker logs -f solar-bot
```

### 3. Check Lead Storage

```bash
# SSH into server
cat data/leads.json

# Or via API
curl https://your-domain.com/api/leads/stats
```

---

## 🚨 Troubleshooting

### Issue: "Cannot find module"

**Solution:**
```bash
npm install
pm2 restart solar-bot
```

### Issue: "API key invalid"

**Solution:**
Check environment variables:
```bash
# Heroku
heroku config

# EC2
cat .env

# Docker
docker exec solar-bot env | grep API
```

### Issue: "Port already in use"

**Solution:**
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=8080
```

### Issue: "Out of memory"

**Solution:**
- Upgrade server instance size
- Enable swap memory
- Optimize session cleanup

---

## 📊 Monitoring & Maintenance

### Setup PM2 Monitoring (EC2)

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitor
pm2 monit
```

### Automatic Updates

```bash
# Create update script
nano update.sh
```

Add:
```bash
#!/bin/bash
cd /home/ubuntu/solar-sales-bot
git pull origin main
npm install
pm2 restart solar-bot
```

```bash
chmod +x update.sh
```

### Backup Leads Data

```bash
# Create backup script
nano backup-leads.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
cp data/leads.json backups/leads-$DATE.json
```

Schedule with cron:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup-leads.sh
```

---

## 🌐 Custom Domain Setup

### Cloudflare (Recommended)

1. Add your domain to Cloudflare
2. Create A record pointing to server IP
3. Enable SSL/TLS (Full)
4. Enable "Always Use HTTPS"

### Let's Encrypt SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📈 Scaling

### Horizontal Scaling (Load Balancer)

For high traffic, deploy multiple instances behind a load balancer:

1. Deploy to multiple EC2 instances
2. Setup AWS/GCP Load Balancer
3. Use Redis for session storage (replace in-memory state)

### Vertical Scaling

Upgrade server resources:
- t2.small → t2.medium → t2.large
- 1GB RAM → 2GB → 4GB

---

## 🎯 Success Metrics

Track these metrics:
- Total conversations started
- Lead conversion rate
- Average conversation length
- Response time
- API error rate
- Server uptime

---

For support: Check README.md or create an issue on GitHub

Happy Deploying! 🚀
