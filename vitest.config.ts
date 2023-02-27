import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    testTimeout: 15000,
    env: {
      LOCAL_BASE_URL: 'http://localhost:3001',
      AWS_BASE_URL: 'https://6n1kzhle0l.execute-api.us-east-1.amazonaws.com',
      WAIT_FOR_SERVER: '5000',
    },
  },
})
