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
Schema validation for environment variables ✅
Usage of global exception filter ✅
Usage of guards, pipes (validation) ✅
Usage of custom decorators ✅
Configure helmet✅, cors✅, rate limit✅ (this last one for reset password feature + login + forget-password) ✅

## Extra points
* Implement resolve field in graphQL queries (if apply)
* When the stock of a product reaches *5*, notify the last user that liked it and not purchased the product yet with an email. ✅
  Use a background job and make sure to include the product's image in the email. ✅
* Send an email when the user changes the password ✅
* Deploy on Hostinger VPS ✅

## Notes: 

Requirements to use Rest: 
* Authentication endpoints (sign up, sign in, sign out, forgot, reset password) ✅
* Stripe Integration for payment (including webhooks management) ✅

Requirements to use Graph: 
* The ones not included in the block above

## Extra features:
* Token invalidation using Redis cache instance ✅
* Refresh token (30 days) + access token (4 hours) ✅
* Product Variations ✅
* Minimal react payment app to simulate payments and receive updates on the webhook in the server. Make sure to use the server endpoints (http://217.15.170.229:3100) ✅
* Users with multiple roles ✅
* Cart Items with discounts (PERCENTAGE | DISCOUNT | NONE). This prices are calculated when retrieving the user cart ✅
* Product search with filters like: gender, minPrice, maxPrice, search, categoryId ✅
* Product search sorters ASC or DESC by name, createdAt, updatedAt, likesCount, price ✅
* VPS upload setup with docker and PM2. Redis/database retry connections in case of failed. Server setup to run instance on server startup in any unexpected shutdown ✅

```

## References:

- Adidas website as reference for this backend and some adaptations based on above general requirements.

## Use the app on the server:

There are 2 apps on a server:

1. http://217.15.170.229:3101/payment?clientSecret=pi_3Qbp0A062gksTdkE0hcMVVpL_secret_p9WJXmIEmJ8X8hhjgE9BK4wGl
2. http://217.15.170.229:3100/api

All you need to have is Postman to test the app.

Here you have the postman used for testing the app. Make sure to have the environments active on you postman.

Variables used: 

- HOST:
    - http://217.15.170.229:3100/api
    - [localhost:3100/api](http://217.15.170.229:3100/api)
- ACCESS_TOKEN

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/3ebd0321-2171-4eda-a3de-1e532f377733/2cde1e7a-529c-41f8-8f14-dca9c7b2fa47/image.png)

Note: access_token is set automatically after login endpoint is successfully hit.

### Fork the request

- For testing purpose you can copy this postman

[RonaldRis Public Workspace](https://www.postman.com/lively-meadow-246836/ronaldris-public-workspace)

- These are the requests used in the project

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/3ebd0321-2171-4eda-a3de-1e532f377733/ca301101-5936-4b85-9c3c-1ba48183588b/image.png)

- You can test them locally on POSTMAN DESKTOP  (to edit the requests make a fork)

 

- Make sure to have then environments active: (white circular check on):

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/3ebd0321-2171-4eda-a3de-1e532f377733/ff6ee70b-fce5-4c1a-bf63-a95132d785be/image.png)

## Run the app locally:

1. Make sure to have installed
    1. Docker 
    2. Docker compose
    3. Node v20
2. Add the .env files:

File can found here: 
Make sure to have it on “nerdery-ecommerce/.env” (need to have  RAVN email)

[](https://drive.google.com/drive/folders/15XvXiOg7e24E-wGZWokJtGZr-hjAv2uc?usp=drive_link)

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
npm install -g @nestjs/cli
npm i
npx prisma migrate dev --name init
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
