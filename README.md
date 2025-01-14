### Build your tiny API store.
You can choose the target of your business, be creative!.
**Examples:** snack store, pet store, drug store.

## Technical Requirements
* PostgreSql
	** Kysely / Drizzle
	** Prisma
* NestJS
* Typescript
* Prettier
* Eslint

## Mandatory Features
1. Authentication endpoints (sign up, sign in, sign out, forgot, reset password) ✅
2. List products with pagination ✅
3. Search products by category ✅
4. Add 2 kinds of users (Manager, Client) ✅
5. As a Manager I can: 
    * Create products ✅
    * Update products ✅ and product variations ✅
    * Delete products ✅ and product variations ✅
    * Disable products ✅ and product variations ✅
    * Show clients orders ✅
    * Upload images per product-variation. ✅
6. As a Client I can:
    * See products ✅
    * See the product variations ✅
    * Buy products ✅
    * Add products to cart ✅
    * Like products ✅
    * Show my order ✅
7. The product information(included the images) should be visible for logged and not logged users ✅
8. Stripe Integration for payment (including webhooks management) ✅

## Mandatory Implementations
* Schema validation for environment variables ✅
* Usage of global exception filter ✅
* Usage of guards, pipes (validation) ✅
* Usage of custom decorators ✅
* Configure helmet✅, cors✅, rate limit✅ (this last one for reset password feature + login + forget-password) ✅

## Extra recomended points
* Implement resolve field in graphQL queries (if apply) + dataloaders 🆗
* When the stock of a product reaches *5*, notify the last user that liked it and not purchased the product yet with an email. ✅
  (Use a background job and make sure to include the product's image in the email. ✅)
* Send an email when the user changes the password ✅
* Deploy on Hostinger VPS ✅

## Personal extra features:
* Token invalidation using Redis cache instance ✅
* Refresh token (30 days) + access token (4 hours) ✅
* Product Variations ✅
* Product Variation discounts (PERCENTAGE | DISCOUNT | NONE) ✅
* Minimal react payment app to simulate payments and receive updates on the webhook in the server. Make sure to use the server endpoints (http://217.15.170.229:3101) ✅
* Users with multiple roles ✅
* Cart Items with discounts (PERCENTAGE | DISCOUNT | NONE). This prices are calculated when retrieving the user cart ✅
* Product search with filters like: gender, minPrice, maxPrice, search, categoryId ✅
* Product search sorters ASC or DESC by name, createdAt, updatedAt, likesCount, price ✅
* VPS upload setup with docker and PM2 ✅
* Redis - database retry connections in case of failed. Server setup to run instance on server startup in any unexpected shutdown ✅


## Notes: 

Requirements to use Rest: 
* Authentication endpoints (sign up, sign in, sign out, forgot, reset password) ✅
* Stripe Integration for payment (including webhooks management) ✅

Requirements to use Graph: 
* The ones not included in the block above 



## References:

- Adidas website as reference for this backend and some adaptations based on above general requirements.

## Use the app on the server:

App has been deployed to a personal VPS in Hostinger. In order to make sure the project is always running smothly, Uptime Robots has been configured as follow:
- App has 2 enpoints /hello and /db to check the backend health
- /hello makes sure the app is running
- /db makes sure the database connection is active
![image](https://github.com/user-attachments/assets/80fc97ef-b205-4eba-8c67-3fbf96d07ec5)


There are 2 apps on a server:

1. http://217.15.170.229:3100/api
2. http://217.15.170.229:3101/payment?clientSecret=pi_3Qbp0A062gksTdkE0hcMVVpL_secret_p9WJXmIEmJ8X8hhjgE9BK4wGl

All you need to have is Postman to test the app.

Variables used in POSTMAN: 

- HOST:
    - http://217.15.170.229:3100/api
    - [localhost:3100/api](http://217.15.170.229:3100/api)
- ACCESS_TOKEN

![image](https://github.com/user-attachments/assets/4f09e792-38ee-4dd8-99c1-c23b6cf95455)

Note: access_token is set automatically after login endpoint is successfully hit.

### POSTMAN TESTS
### Fork the POSTMAN requests from: [RonaldRis Public Workspace](https://www.postman.com/lively-meadow-246836/ronaldris-public-workspace)

- For testing purpose you can copy this postman. Here you have the postman used for testing the app. Make sure to have the environments active on you postman: 

[RonaldRis Public Workspace](https://www.postman.com/lively-meadow-246836/ronaldris-public-workspace)

- These are the requests used in the project

![image](https://github.com/user-attachments/assets/bb747d10-fe41-46ee-ae27-ec8963cb6e39)

- You can test them locally on POSTMAN DESKTOP  (to edit the requests make a fork)

 ![image](https://github.com/user-attachments/assets/261b4a23-5a6d-4ca1-8013-d4484ebcf5a2)


- Make sure to have then environments active: (white circular check on):

![image](https://github.com/user-attachments/assets/4520c176-d695-4362-8f77-c1ed1da3f748)

## Run the app locally:

1. Make sure to have installed
    1. Docker 
    2. Docker compose
    3. Node v20
2. Add the .env files:

File can found here: 
Make sure to have it on “nerdery-ecommerce/.env” (need to have  RAVN email)

[.env real data for production - download from google drive](https://drive.google.com/drive/folders/15XvXiOg7e24E-wGZWokJtGZr-hjAv2uc?usp=drive_link)

1. You need 3 console to completely run this app:
- Docker Compose:

```bash

cd nerdery-ecommerce
docker-compose up --build

```

- Nest.js backend

```bash
cd nerdery-ecommerce
nvm use 20
npm install -g @nestjs/cli prisma
npm i
npx prisma migrate deploy
npm run seed
npm run start:dev
```

- React app to pay order

```bash
cd react-stripe-app
nvm use 20
npm i
npm run start
```

- Self note - On server:
    - Pull master
        
        ```bash
        cd /home/ubuntu/ris/Nerdery-Ecommerce-Backend-Nestjs
        git pull origin master
        ```
        
    - PM2
        
        ```bash
        nvm use 20
        pm2 list
        pm2 restart nerdery-backend nerdery-frontend
        
        ```

## Coverage:
- This can be seen by running the command: **npm run coverage**
- Or in **'/nerdery-ecommerce/coverage-copy'** folder
![image](https://github.com/user-attachments/assets/e8e81579-ebbf-4434-ae8d-0d1ec1d0bbd4)


## Uptime robots
- Make sure the apps are running smothly
- Receive emails if app is down
- Check app on /api/hello abd database health on /api/db
![image](https://github.com/user-attachments/assets/80fc97ef-b205-4eba-8c67-3fbf96d07ec5)

## PM2 Dashboard 
- Restart apps from web dashboard
- See logs in realtime
![image](https://github.com/user-attachments/assets/eead6a39-b5e5-49d2-8c9d-d67455f7fae9)

