import { AddSchema, UpdateSchema } from './schema'
import { handlerPath } from '@libs/handler-resolver'

export const addCategory = {
  handler: `${handlerPath(__dirname)}/handler.addCategory`,
  events: [
    {
      http: {
        method: 'post',
        path: 'category',
        request: {
          schemas: {
            'application/json': AddSchema,
          },
        },
      },
    },
  ],
}

export const updateCategory = {
  handler: `${handlerPath(__dirname)}/handler.updateCategory`,
  events: [
    {
      http: {
        method: 'patch',
        path: 'category',
        request: {
          schemas: {
            'application/json': UpdateSchema,
          },
        },
      },
    },
  ],
}

export const removeCategory = {
  handler: `${handlerPath(__dirname)}/handler.removeCategory`,
  events: [
    {
      http: {
        method: 'delete',
        path: 'category/{id}',
      },
    },
  ],
}

export const listCategories = {
  handler: `${handlerPath(__dirname)}/handler.listCategories`,
  events: [
    {
      http: {
        method: 'get',
        path: 'categories',
      },
    },
  ],
}

export const getCategory = {
  handler: `${handlerPath(__dirname)}/handler.getCategory`,
  events: [
    {
      http: {
        method: 'get',
        path: 'category/{id}',
      },
    },
  ],
}
