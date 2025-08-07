import { createUser } from "../src/services/user.service"
import { expect, test } from '@jest/globals'

//test para crear usuario
test('crear usuario', async () => {
  const user = await createUser({
    name: 'Diego',
    email: 'diego@gmail.com',
    password: '12345678',
    isAdmin: true,
    IsActive: true,
  })

  expect(user).toBeDefined()
})
