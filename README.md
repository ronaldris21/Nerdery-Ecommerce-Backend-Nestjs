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
    * Update products and product variations
    * Delete products and product variations
    * Disable products and product variations
    * Show clients orders
    * Upload images per product.
6. As a Client I can:
    * See products 
    * See the product variations
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

References:

- Adidas website as reference for this backend and some adaptations based on above general requirements.

## Specifications:

- on Backend-Planification folder you have the initial planning doc for the database and expected final API using openAPI - Swagger.
    - DATABASE can be check on this website  using the **Backend-Planification/database_diagram.erdl**
    
    [Database Diagram Tool](https://databasediagram.com/app)
    
    - Rest API can be checked on this website  using the **Backend-Planification/swagger.yaml** file
    
    [Swagger Editor](https://editor.swagger.io/)
    
    - GRAPHQL can be checked on this link using: **allSchemas.graphql**
    
    [GraphQL Editor - Create backends from GraphQL schema](https://academy.graphqleditor.com/?lesson=tutorial)
    

# Nestjs Design Considerations - Doc

## Auth - Roles

- userId is fetched from JWT
- GraphQL inputs DO NOT USE THE userId
- Requesting as MANAGER or CLIENT
    - by default if Auth validation is Okay, user is assume to be a CLIENT
    - if MANAGER or another role, role must be specified on the HEADER:

## GraphQL Schemas:

This schemas are mainly created by having specific:

- Enumerations (if needed)
- Type definitions
- Inputs
- Queries
- Mutations

# CHECK BEFORE SEND:

- [ ]  Pagination
- [ ]  Inputs
- [ ]  Mutations
- [ ]  Graph Relations on  https://academy.graphqleditor.com/?lesson=tutorial