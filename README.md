# Nerdery - Nodejs Final challenge

Requirements:

```jsx
## Mandatory Features

1. Authentication endpoints (sign up, sign in, sign out, forgot, reset password)
2. List products with pagination
3. Search products by category
4. Add 2 kinds of users (Manager, Client)
5. As a Manager I can:
    * Create products
    * Update products and product details
    * Delete products and product details
    * Disable products and product details
    * Show clients orders
    * Upload images per product.
6. As a Client I can:
    * See products 
    * See the product details
    * Buy products
    * Add products to cart
    * Like products
    * Show my order
7. The product information(included the images) should be visible for logged and not logged users
8. Stripe Integration for payment (including webhooks management) 

## Extra points

* When the stock of a product reaches 3, notify the last user that liked it and not purchased the product yet with an email. 
* Send an email when the user changes the password

```

## Specifications:

- on Backend-Planification folder you have the initial planning doc for the database and expected final API using openAPI - Swagger.
    - DATABASE can be check on: https://databasediagram.com/app using the `database_diagram.erdl` or by using the `database_diagram.image`
    - Rest API can be checked on https://editor.swagger.io/ using the `swagger.yaml` file