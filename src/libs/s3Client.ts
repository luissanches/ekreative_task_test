import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

const s3Client = new S3Client({})

export function fileUpload(fileName: string, fileStream: any) {
  const uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Body: fileStream,
  }
  return s3Client.send(new PutObjectCommand(uploadParams))
}

export function fileRemove(fileName: string) {
  const deleteParams: DeleteObjectCommandInput = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
  }
  return s3Client.send(new DeleteObjectCommand(deleteParams))
}

export function filesRemove(keys: string[]) {
  const deleteParams: DeleteObjectsCommandInput = {
    Bucket: process.env.BUCKET_NAME,
    Delete: {
      Objects: keys.map((Key) => ({ Key })),
    },
  }
  return s3Client.send(new DeleteObjectsCommand(deleteParams))
}
