import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({})
const documentClient = DynamoDBDocument.from(client)

export function addDocument(tableName: string, item: Record<string, any>) {
  return documentClient.put({
    TableName: tableName,
    Item: item,
  })
}

export type UpdateExpressionType = {
  UpdateExpression?: string
  ExpressionAttributeNames: Record<string, string>
  ExpressionAttributeValues: Record<string, string | number | Array<string>>
}

export function updateDocument(tableName: string, id: string, expressions: UpdateExpressionType) {
  return documentClient.update({
    TableName: tableName,
    Key: {
      Id: id,
    },
    ...expressions,
  })
}

export function getDocument(tableName: string, id: string) {
  return documentClient.get({
    TableName: tableName,
    Key: {
      Id: id,
    },
  })
}

export function removeDocument(tableName: string, id: string) {
  return documentClient.delete({
    TableName: tableName,
    Key: {
      Id: id,
    },
  })
}

export function listDocuments(tableName: string) {
  return documentClient.scan({
    TableName: tableName,
  })
}
