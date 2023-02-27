import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { ValidatedEventAPIGatewayProxyEvent, formatJSONErrorResponse } from '@libs/api-gateway'
import { formatJSONResponse } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'
import { fileUpload, fileRemove } from '@libs/s3Client.js'
import { getFileExtension, convertToStream } from '@libs/image'
import { addDocument, getDocument, removeDocument, listDocuments, updateDocument } from '@libs/dynamoDB'
import type { UpdateExpressionType } from '@libs/dynamoDB'
import { AddSchema, UpdateSchema } from './schema'

const add: ValidatedEventAPIGatewayProxyEvent<typeof AddSchema> = async (event) => {
  try {
    const uuid = uuidv4()
    const fileStream = convertToStream(event.body.image)
    const fileType = getFileExtension(event.body.image)
    const fileName = `${uuid}.${fileType}`

    const s3Response = await fileUpload(`categories/${fileName}`, fileStream)
    if (s3Response.$metadata.httpStatusCode !== 200) {
      throw new Error('Error to upload the image to S3')
    }

    const document = {
      Id: uuid,
      Name: event.body.name,
      Description: event.body.description,
      ImageUrl: `${process.env.BUCKET_URL}/categories/${fileName}`,
    }

    const dbResponse = await addDocument(process.env.CATEGORIES_TABLE, document)
    if (dbResponse.$metadata.httpStatusCode !== 200) {
      await fileRemove(fileName)
      throw new Error('Error to create the db record.')
    }

    return formatJSONResponse({ message: 'Document has been created successfully', document })
  } catch (err) {
    return formatJSONErrorResponse(err.message)
  }
}

const update: ValidatedEventAPIGatewayProxyEvent<typeof UpdateSchema> = async (event) => {
  try {
    let dbResponse = await getDocument(process.env.CATEGORIES_TABLE, event.body.id)
    if (dbResponse.$metadata.httpStatusCode !== 200) {
      throw Error('Error to retrieve the document.')
    }

    if (!dbResponse.Item) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Not found.' }),
      }
    }

    let fileName = path.basename(dbResponse.Item.ImageUrl)
    await fileRemove(`categories/${fileName}`)

    const fileStream = convertToStream(event.body.image)
    const fileType = getFileExtension(event.body.image)
    fileName = `${event.body.id}.${fileType}`

    const s3Response = await fileUpload(`categories/${fileName}`, fileStream)
    if (s3Response.$metadata.httpStatusCode !== 200) {
      throw new Error('Error to upload the image to S3')
    }

    const updateExpression: UpdateExpressionType = {
      UpdateExpression: 'SET #nameAttr = :categoryName, Description = :description',
      ExpressionAttributeNames: {
        '#nameAttr': 'Name',
      },
      ExpressionAttributeValues: {
        ':categoryName': event.body.name,
        ':description': event.body.description,
      },
    }

    dbResponse = await updateDocument(process.env.CATEGORIES_TABLE, event.body.id, updateExpression)
    if (dbResponse.$metadata.httpStatusCode !== 200) {
      await fileRemove(fileName)
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

    let dbResponse = await getDocument(process.env.CATEGORIES_TABLE, event.pathParameters.id)

    if (dbResponse.$metadata.httpStatusCode !== 200) {
      throw Error('Error to retrieve the document.')
    }

    if (!dbResponse.Item) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Not found.' }),
      }
    }

    const fileName = path.basename(dbResponse.Item.ImageUrl)
    await fileRemove(`categories/${fileName}`)
    dbResponse = await removeDocument(process.env.CATEGORIES_TABLE, event.pathParameters.id)
    if (dbResponse.$metadata.httpStatusCode !== 200) {
      throw Error('Error to remove the document.')
    }

    return formatJSONResponse({ message: 'Document has been removed successfully.' })
  } catch (err) {
    return formatJSONErrorResponse(err.message)
  }
}

const list: APIGatewayProxyHandler = async () => {
  const dbResponse = await listDocuments(process.env.CATEGORIES_TABLE)
  if (dbResponse.$metadata.httpStatusCode !== 200) {
    throw Error('Error to retrieve the documents.')
  }
  return {
    statusCode: 200,
    body: JSON.stringify(dbResponse.Items),
  }
}

const get: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  let dbResponse = await getDocument(process.env.CATEGORIES_TABLE, event.pathParameters.id)
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

export const addCategory = middyfy(add)
export const updateCategory = middyfy(update)
export const removeCategory = middyfy(remove)
export const listCategories = middyfy(list)
export const getCategory = middyfy(get)
