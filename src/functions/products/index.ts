import { AddSchema, UpdateSchema } from './schema'
import { handlerPath } from '@libs/handler-resolver'

export const addProduct = {
  handler: `${handlerPath(__dirname)}/handler.addProduct`,
  events: [
    {
      http: {
        method: 'post',
        path: 'product',
        request: {
          schemas: {
            'application/json': AddSchema,
          },
        },
      },
    },
  ],
}

export const updateProduct = {
  handler: `${handlerPath(__dirname)}/handler.updateProduct`,
  events: [
    {
      http: {
        method: 'patch',
        path: 'product',
        request: {
          schemas: {
            'application/json': UpdateSchema,
          },
        },
      },
    },
  ],
}

export const removeProduct = {
  handler: `${handlerPath(__dirname)}/handler.removeProduct`,
  events: [
    {
      http: {
        method: 'delete',
        path: 'product/{id}',
      },
    },
  ],
}

export const listProducts = {
  handler: `${handlerPath(__dirname)}/handler.listProducts`,
  events: [
    {
      http: {
        method: 'get',
        path: 'products',
      },
    },
  ],
}

export const getProduct = {
  handler: `${handlerPath(__dirname)}/handler.getProduct`,
  events: [
    {
      http: {
        method: 'get',
        path: 'product/{id}',
      },
    },
  ],
}
