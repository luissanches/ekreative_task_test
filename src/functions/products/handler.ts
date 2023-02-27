import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { ValidatedEventAPIGatewayProxyEvent, formatJSONErrorResponse } from '@libs/api-gateway'
import { formatJSONResponse } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'
import { fileUpload, filesRemove } from '@libs/s3Client.js'
import { getFileExtension, convertToStream } from '@libs/image'
import {
  addDocument,
  getDocument,
  removeDocument,
  listDocuments,
  updateDocument,
  UpdateExpressionType,
} from '@libs/dynamoDB'
import { AddSchema, UpdateSchema } from './schema'

const add: ValidatedEventAPIGatewayProxyEvent<typeof AddSchema> = async (event) => {
  try {
    const uuid = uuidv4()
    const imagesUrls: string[] = []
    const imageKeys: string[] = []
    const parallelS3Upload = []

    event.body.images.forEach((image: string, index: number) => {
      const fileStream = convertToStream(image)
      const fileType = getFileExtension(image)
      const fileName = `${index}.${fileType}`
      const imageKey = `products/${uuid}/${fileName}`

      imagesUrls.push(`${process.env.BUCKET_URL}/products/${uuid}/${fileName}`)
      parallelS3Upload.push(fileUpload(imageKey, fileStream))
      imageKeys.push(imageKey)
    })

    const s3Responses = await Promise.allSettled(parallelS3Upload)
    if (s3Responses.some((item) => item.status !== 'fulfilled')) {
      await filesRemove(imageKeys)
      throw new Error('Error to upload the images to S3')
    }

    const document = {
      Id: uuid,
      Name: event.body.name,
      Description: event.body.description,
      Category: event.body.category,
      Price: event.body.price,
      Images: imagesUrls,
    }

    const dbResponse = await addDocument(process.env.PRODUCTS_TABLE, document)
    if (dbResponse.$metadata.httpStatusCode !== 200) {
      await filesRemove(imageKeys)
      throw new Error('Error to create the db record.')
    }

    return formatJSONResponse({ message: 'Document has been created successfully', document })
  } catch (err) {
    return formatJSONErrorResponse(err.message)
  }
}

const update: ValidatedEventAPIGatewayProxyEvent<typeof UpdateSchema> = async (event) => {
  try {
    let dbResponse = await getDocument(process.env.PRODUCTS_TABLE, event.body.id)
    if (dbResponse.$metadata.httpStatusCode !== 200) {
      throw Error('Error to retrieve the document.')
    }

    if (!dbResponse.Item) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Not found.' }),
      }
    }

    const imageKeys: string[] = []
    dbResponse.Item.Images.forEach((imageUrl) => {
      const fileName = path.basename(imageUrl)
      imageKeys.push(`products/${dbResponse.Item.Id}/${fileName}`)
    })
    await filesRemove(imageKeys)

    const imagesUrls: string[] = []
    const parallelS3Upload = []

    event.body.images.forEach((image: string, index: number) => {
      const fileStream = convertToStream(image)
      const fileType = getFileExtension(image)
      const fileName = `${index}.${fileType}`
      const imageKey = `products/${event.body.id}/${fileName}`

      imagesUrls.push(`${process.env.BUCKET_URL}/products/${event.body.id}/${fileName}`)
      parallelS3Upload.push(fileUpload(imageKey, fileStream))
    })

    const s3Responses = await Promise.allSettled(parallelS3Upload)
    if (s3Responses.some((item) => item.status !== 'fulfilled')) {
      await filesRemove(imageKeys)
      throw new Error('Error to upload the images to S3')
    }

    const updateExpression: UpdateExpressionType = {
      UpdateExpression:
        'SET #nameAttr = :productName, Description = :description, Category = :category, Price = :price, Images = :images',
      ExpressionAttributeNames: {
        '#nameAttr': 'Name',
      },
      ExpressionAttributeValues: {
        ':productName': event.body.name,
        ':description': event.body.description,
        ':category': event.body.category,
        ':price': event.body.price,
        ':images': imagesUrls,
      },
    }

    dbResponse = await updateDocument(process.env.PRODUCTS_TABLE, event.body.id, updateExpression)
    if (dbResponse.$metadata.httpStatusCode !== 200) {
      await filesRemove(imageKeys)
      throw new Error('Error to update the db record.')
    }

    return formatJSONResponse({ message: 'Document has been updated successfully' })
  } catch (err) {
    return formatJSONErrorResponse(err.message)
  }
}

const remove: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!event.pathParameters.id) {
      throw Error('Document Id is required.')
    }

    let dbResponse = await getDocument(process.env.PRODUCTS_TABLE, event.pathParameters.id)

    if (dbResponse.$metadata.httpStatusCode !== 200) {
      throw Error('Error to retrieve the document.')
    }

    if (!dbResponse.Item) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Not found.' }),
      }
    }

    const imageKeys: string[] = []
    dbResponse.Item.Images.forEach((imageUrl) => {
      const fileName = path.basename(imageUrl)
      imageKeys.push(`products/${dbResponse.Item.Id}/${fileName}`)
    })
    await filesRemove(imageKeys)

    dbResponse = await removeDocument(process.env.PRODUCTS_TABLE, event.pathParameters.id)
    if (dbResponse.$metadata.httpStatusCode !== 200) {
      throw Error('Error to remove the document.')
    }

    return formatJSONResponse({ message: 'Document has been removed successfully.' })
  } catch (err) {
    return formatJSONErrorResponse(err.message)
  }
}

const list: APIGatewayProxyHandler = async () => {
  const dbResponse = await listDocuments(process.env.PRODUCTS_TABLE)
  if (dbResponse.$metadata.httpStatusCode !== 200) {
    throw Error('Error to retrieve the documents.')
  }
  return {
    statusCode: 200,
    body: JSON.stringify(dbResponse.Items),
  }
}

const get: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  let dbResponse = await getDocument(process.env.PRODUCTS_TABLE, event.pathParameters.id)
  if (dbResponse.$metadata.httpStatusCode !== 200) {
    throw Error('Error to retrieve the document.')
  }
  if (!dbResponse.Item) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Not found.' }),
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify(dbResponse.Item),
  }
}

export const addProduct = middyfy(add)
export const updateProduct = middyfy(update)
export const removeProduct = middyfy(remove)
export const listProducts = middyfy(list)
export const getProduct = middyfy(get)
