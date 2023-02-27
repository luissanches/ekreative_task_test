import type { AWS } from '@serverless/typescript'

import { addCategory, updateCategory, removeCategory, listCategories, getCategory } from './src/functions/categories'
import { addProduct, updateProduct, removeProduct, listProducts, getProduct } from './src/functions/products'

const serverlessConfiguration: AWS = {
  service: 'lambda-project',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      BUCKET_NAME: 'image-s3-source',
      BUCKET_URL: 'https://image-s3-source.s3.amazonaws.com',
      CATEGORIES_TABLE: 'Categories',
      PRODUCTS_TABLE: 'Products',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:GetObject', 's3:DeleteObject', 's3:PutObject'],
            Resource: 'arn:aws:s3:::image-s3-source/*',
          },
          {
            Effect: 'Allow',
            Action: ['dynamodb:Query', 'dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:DeleteItem'],
            Resource: 'arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/*',
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: {
    addCategory,
    updateCategory,
    removeCategory,
    getCategory,
    listCategories,
    addProduct,
    updateProduct,
    removeProduct,
    listProducts,
    getProduct,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    'serverless-offline': {
      httpPort: 3001,
    },
  },
}

module.exports = serverlessConfiguration
