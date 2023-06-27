# TicketBlock API

------------


# Start App

### Development: In Development mode, the express app is started with nodemon for automatic refresh when changes are made.
	npm run dev
### Test: Run test in development environment
	npm test
### Production: Run app in production environment
	npm start

### Deploy app via pm2
    pm2 start npm --name "ticket-block-api" -- start

#### Using specific Node version	
	pm2 start npm --name "ticket-block-api-test" -- start --interpreter=/root/.nvm/versions/node/v14.16.1/bin/node

