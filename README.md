# Zhagaram Jewellery API

Backend API for Zhagaram Jewellery - A comprehensive jewellery shop management system.

## Features

- 🔐 JWT Authentication
- 👤 User Management (Admin & Regular Users)
- 📦 Product Management with Categories
- 🖼️ Image Upload & Storage in MongoDB
- 💎 Rental Items Support
- 🔒 Role-based Access Control

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Security**: bcryptjs for password hashing

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm start
```

## Deployment to Vercel

### Prerequisites
- MongoDB Atlas account (free tier available)
- Vercel account
- Vercel CLI installed: `npm install -g vercel`

### Steps

1. **Set up MongoDB Atlas**:
   - Create a free MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
   - Get your connection string (replace `<password>` with your database password)
   - Whitelist all IPs (0.0.0.0/0) for Vercel serverless functions

2. **Deploy to Vercel**:
   ```bash
   # Login to Vercel
   vercel login

   # Deploy
   vercel
   ```

3. **Set Environment Variables in Vercel**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add ADMIN_USERNAME
   vercel env add ADMIN_PASSWORD
   ```

   Or set them in the Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from `.env.example`

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User/Admin login
- `POST /api/auth/register` - User registration

### Categories (Admin only for POST/PUT/DELETE)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/:id/image` - Get category image

### Products (Admin only for POST/PUT/DELETE)
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id/image/:index` - Get product image

### Health Check
- `GET /api/health` - API health status

## Admin Credentials

Default admin credentials (change in production!):
- Username: `Zhagaram`
- Password: `jagan123`

## License

ISC
