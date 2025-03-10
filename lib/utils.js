import fs from 'fs'
import path from 'path'
import csvParser from 'csv-parser'

/**
 * Parse phone numbers from a file (JSON or CSV)
 * @param {string} filePath - Path to the file
 * @returns {Promise<string[]>} - List of phone numbers
 */
export async function parseInputFile (filePath) {
  const fileExtension = path.extname(filePath).toLowerCase()

  if (fileExtension === '.json') {
    return parseJsonFile(filePath)
  } else if (fileExtension === '.csv') {
    return parseCsvFile(filePath)
  } else {
    throw new Error(`Unsupported file format: ${fileExtension}. Only .json and .csv files are supported.`)
  }
}

/**
 * Parse phone numbers from a JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<string[]>} - List of phone numbers
 */
function parseJsonFile (filePath) {
  return new Promise((resolve, reject) => {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      if (!data) {
        throw new Error('Invalid or empty JSON data: array of numbers or objects with "numbers" property expected')
      }

      // Handle different JSON structures
      if (Array.isArray(data)) {
        if (typeof data[0] === 'string') {
          // Array of strings
          resolve(data)
        } else if (typeof data[0] === 'object') {
          // Array of objects, look for phone field
          const phoneNumbers = data.map(item => {
            return item.phone || item.phoneNumber || item.number || item.phone_number || null
          }).filter(Boolean)
          resolve(phoneNumbers)
        } else {
          throw new Error('Invalid JSON structure')
        }
      } else if (Object.prototype.toString.call(data) === '[object Object]') {
        // Object with phone numbers as keys or values
        if (Array.isArray(data.phoneNumbers || data.phones || data.numbers)) {
          resolve(data.phoneNumbers || data.phones || data.numbers)
        } else {
          // Try to find phone-like values in the object
          const phoneNumbers = Object.values(data).filter(value => typeof value === 'string')
          resolve(phoneNumbers)
        }
      } else {
        throw new Error('Invalid JSON structure')
      }
    } catch (error) {
      reject(new Error(`Failed to parse JSON file: ${error.message}`))
    }
  })
}

/**
 * Parse phone numbers from a CSV file
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<string[]>} - List of phone numbers
 */
function parseCsvFile (filePath) {
  return new Promise((resolve, reject) => {
    const phoneNumbers = []

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        // Try to find phone number in any of the common column names
        const phoneNumber = row.phone || row.phoneNumber || row.phone_number || row.number || Object.values(row)[0]
        if (phoneNumber) {
          phoneNumbers.push(phoneNumber.trim())
        }
      })
      .on('end', () => {
        resolve(phoneNumbers)
      })
      .on('error', (error) => {
        reject(new Error(`Failed to parse CSV file: ${error.message}`))
      })
  })
}

export default {
  parseInputFile
}
