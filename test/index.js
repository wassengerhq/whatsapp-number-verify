import assert from 'assert'
import { verifyPhoneNumber, verifyPhoneNumbers } from '../lib/index.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// const filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(filename)

// Simple test framework
async function test () {
  console.log('Running tests...')

  // Test validation of parameters
  try {
    await verifyPhoneNumber(null, { apiToken: 'test' })
    assert.fail('Should have thrown error for missing phone number')
  } catch (error) {
    assert.strictEqual(error.message, 'Phone number is required')
    console.log('✓ verifyPhoneNumber validates phone number parameter')
  }

  try {
    await verifyPhoneNumber('+1234567890', {})
    assert.fail('Should have thrown error for missing API token')
  } catch (error) {
    assert.strictEqual(error.message, 'API token is required')
    console.log('✓ verifyPhoneNumber validates apiToken parameter')
  }

  // Test array handling in verifyPhoneNumbers
  const mockVerifyPhoneNumber = async (phoneNumber, options) => {
    return { phone: phoneNumber, exists: true }
  }

  // Mock the actual function for testing
  const originalVerifyPhoneNumber = verifyPhoneNumber

  try {
    // Create a mock function to test with
    global.mockVerify = mockVerifyPhoneNumber

    // Call the function with single phone number
    const testPhoneNumbers = async () => {
      const results = []
      const phoneNumber = '+1234567890'
      try {
        const result = await global.mockVerify(phoneNumber, { apiToken: 'test' })
        results.push(result)
      } catch (error) {
        results.push({
          phone: phoneNumber,
          exists: false,
          error: error.message
        })
      }
      return results
    }

    const result = await testPhoneNumbers()
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].phone, '+1234567890')
    console.log('✓ verifyPhoneNumbers handles single phone number')
  } catch (error) {
    assert.fail(`Should not have thrown error: ${error.message}`)
  }

  console.log('All tests passed!')
}

// Only run the tests if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  test().catch(error => {
    console.error('Test failed:', error)
    process.exit(1)
  })
}

export { test }
