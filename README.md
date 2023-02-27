# Test task for SmartSuite Developer

## Installation/deployment instructions

> **Requirements**: NodeJS `v.14.15.0` or greater.

### Configuring the dependencies

- Configure an Aws credential with grant to access S3 Bucket, DynamoDB, Lamda, and API Gateway through `aws configure`
- Create a S3 bucket to save images
- Configure BUCKET_NAME variable with created S3 bucket in serverless.ts file.
- Create the tables Categories and Products in DynamoDB. Use Id as a Partitio key for both tables.
- Configure CATEGORIES_TABLE and PRODUCTS_TABLE variables in serverless.ts file.
- (Optional) Configure the public access + static websit hosting for image validation. In that case you can
  configure BUCKET_URL variable the S3 bucket base URL in serverless.ts file.

### Using NPM

- Run `npm i` to install the project dependencies

## Test your service

- In case you want to test it directly in AWS environment, please, Run `npm run deploy` before execute the tests.
  Also configure the AWS_BASE_URL variable in vitest.config.ts file
- Run either `npm run test:local` to run the tests localy or `npm run test:aws`
- You can also Run `npm start` and use the Postman app importing the requests from test.postman_collection.json file.

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas

### S3 bucket police example

- Find below the Resource property and replace it based on your S3 bucket arn.

```
{
    "Version": "2012-10-17",
    "Id": "Policy1677451910767",
    "Statement": [
        {
            "Sid": "Stmt1677451905828",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::image-s3-source/*"
        }
    ]
}
```
