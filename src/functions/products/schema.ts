export const AddSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    category: { type: 'string' },
    images: { type: 'array' },
    price: { type: 'number' },
  },
  required: ['name', 'description', 'category', 'images', 'price'],
} as const

export const UpdateSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    ...AddSchema.properties,
  },
  required: ['id', ...AddSchema.required],
} as const
