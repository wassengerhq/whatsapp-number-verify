import axios from 'axios'
import { env } from 'process'

/**
 * @typedef {Object} VerifyOptions
 * @property {string} apiToken - Wassenger API token
 * @property {string} [apiUrl='https://api.wassenger.com/v1/numbers/exists'] - API endpoint URL
 */

/**
 * Verify if a phone number exists on WhatsApp
 * @param {string} phoneNumber - Phone number to verify
 * @param {VerifyOptions} options - Options for verification
 * @returns {Promise<Object>} - WhatsApp verification result
 */
export async function verifyPhoneNumber (phoneNumber, options = {}) {
  if (!phoneNumber) throw new Error('Phone number is required')

  options.apiToken = options.apiToken || env.WASSENGER_API_TOKEN
  if (!options.apiToken) {
    throw new Error('API token is required')
  }

  const apiUrl = options.apiUrl || 'https://api.wassenger.com/v1/numbers/exists'

  try {
    const response = await axios({
      method: 'GET',
      url: `${apiUrl}?phone=${encodeURIComponent(phoneNumber)}`,
      headers: {
        'Content-Type': 'application/json',
        Token: options.apiToken
      }
    })

    return response.data
  } catch (error) {
    if (error.response) {
      throw new Error(`API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`)
    } else if (error.request) {
      throw new Error('No response received from Wassenger API')
    } else {
      throw new Error(`Request error: ${error.message}`)
    }
  }
}

/**
 * Verify multiple phone numbers on WhatsApp
 * @param {string[]} phoneNumbers - List of phone numbers to verify
 * @param {VerifyOptions} options - Options for verification
 * @returns {Promise<Object[]>} - WhatsApp verification results
 */
export async function verifyPhoneNumbers (phoneNumbers, options) {
  if (!Array.isArray(phoneNumbers)) {
    phoneNumbers = [phoneNumbers]
  }

  const results = []

  // Process phone numbers in series
  for (const phoneNumber of phoneNumbers) {
    try {
      const result = await verifyPhoneNumber(phoneNumber, options)
      results.push(result)
    } catch (error) {
      results.push({
        phone: phoneNumber,
        exists: false,
        error: error.message
      })
    }
  }

  return results
}

export default {
  verifyPhoneNumber,
  verifyPhoneNumbers
}
