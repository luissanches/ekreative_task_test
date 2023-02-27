export const AddSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    image: { type: 'string' },
  },
  required: ['name', 'description', 'image'],
} as const

export const UpdateSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    ...AddSchema.properties,
  },
  required: ['id', ...AddSchema.required],
} as const
