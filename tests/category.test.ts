import { expect, test, beforeAll, describe } from 'vitest'
import axios from 'axios'
import randomString from 'randomstring'
import mockAddCategory from './mocks/mock_add_category.json'
import mockUpdateCategory from './mocks/mock_update_category.json'

const base_url = process.env.IS_LOCAL ? process.env.LOCAL_BASE_URL : process.env.AWS_BASE_URL

async function waitServer(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

beforeAll(async () => {
  await waitServer(parseInt(process.env.WAIT_FOR_SERVER!))
})

describe('Apply basic happy path tests to Products', () => {
  test('Should add a new Category successfully', async () => {
    const randomName = randomString.generate(5)
    mockAddCategory.name = randomName
    const response = await axios.post(`${base_url}/dev/category`, mockAddCategory)
    expect(response.data).not.toBeNull()
    expect(response.data).toHaveProperty('document')
    expect(response.data.document.Name).equals(randomName)
  })

  test('Should list all Categories', async () => {
    let response = await axios.post(`${base_url}/dev/category`, mockAddCategory)
    response = await axios.get(`${base_url}/dev/categories`)
    expect(response.data.length).greaterThan(0)
  })

  test('Should update a created Category', async () => {
    let randomName = randomString.generate(5)
    mockAddCategory.name = randomName
    let response = await axios.post(`${base_url}/dev/category`, mockAddCategory)
    expect(response.data).not.toBeNull()
    expect(response.data).toHaveProperty('document')
    expect(response.data.document.Name).equals(randomName)

    randomName = randomString.generate(5)
    mockUpdateCategory.id = response.data.document.Id
    mockUpdateCategory.name = randomName
    response = await axios.patch(`${base_url}/dev/category`, mockUpdateCategory)
    expect(response.data).not.toBeNull()

    response = await axios.get(`${base_url}/dev/category/${mockUpdateCategory.id}`)
    expect(response.data).not.toBeNull()
    expect(response.data.Name).equals(mockUpdateCategory.name)
  })

  test('Should delete a Category', async () => {
    let randomName = randomString.generate(5)
    mockAddCategory.name = randomName
    let response = await axios.post(`${base_url}/dev/category`, mockAddCategory)
    expect(response.data).not.toBeNull()
    expect(response.data).toHaveProperty('document')
    expect(response.data.document.Name).equals(randomName)
    response = await axios.delete(`${base_url}/dev/category/${response.data.document.Id}`)
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('message')
    expect(response.data.message).equals('Document has been removed successfully.')
  })
})
