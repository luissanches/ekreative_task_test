import { expect, test, beforeAll, describe } from 'vitest'
import axios from 'axios'
import randomString from 'randomstring'
import mockAddProduct from './mocks/mock_add_product.json'
import mockUpdateProduct from './mocks/mock_update_product.json'

const base_url = process.env.IS_LOCAL ? process.env.LOCAL_BASE_URL : process.env.AWS_BASE_URL

async function waitServer(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

beforeAll(async () => {
  await waitServer(parseInt(process.env.WAIT_FOR_SERVER!))
})

describe('Apply basic happy path tests to Products', () => {
  test('Should add a new Product successfully', async () => {
    const randomName = randomString.generate(5)
    mockAddProduct.name = randomName
    const response = await axios.post(`${base_url}/dev/product`, mockAddProduct)
    expect(response.data).not.toBeNull()
    expect(response.data).toHaveProperty('document')
    expect(response.data.document.Name).equals(randomName)
  })

  test('Should list all Categories', async () => {
    let response = await axios.post(`${base_url}/dev/product`, mockAddProduct)
    response = await axios.get(`${base_url}/dev/products`)
    expect(response.data.length).greaterThan(0)
  })

  test('Should update a created Product', async () => {
    let randomName = randomString.generate(5)
    mockAddProduct.name = randomName
    let response = await axios.post(`${base_url}/dev/product`, mockAddProduct)
    expect(response.data).not.toBeNull()
    expect(response.data).toHaveProperty('document')
    expect(response.data.document.Name).equals(randomName)
    randomName = randomString.generate(5)
    mockUpdateProduct.id = response.data.document.Id
    mockUpdateProduct.name = randomName
    response = await axios.patch(`${base_url}/dev/product`, mockUpdateProduct)
    expect(response.data).not.toBeNull()
    response = await axios.get(`${base_url}/dev/product/${mockUpdateProduct.id}`)
    expect(response.data).not.toBeNull()
    expect(response.data.Name).equals(mockUpdateProduct.name)
  })

  test('Should delete a Product', async () => {
    let randomName = randomString.generate(5)
    mockAddProduct.name = randomName
    let response = await axios.post(`${base_url}/dev/product`, mockAddProduct)
    expect(response.data).not.toBeNull()
    expect(response.data).toHaveProperty('document')
    expect(response.data.document.Name).equals(randomName)
    response = await axios.delete(`${base_url}/dev/product/${response.data.document.Id}`)
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('message')
    expect(response.data.message).equals('Document has been removed successfully.')
  })
})
