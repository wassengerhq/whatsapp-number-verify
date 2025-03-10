# WhatsApp Number Verify

A Node.js package to verify if phone numbers exist on WhatsApp and can receive messages.

Provides both programatic API for Node.js / Deno / Bun and command-line interface.

## Features

- Verify a single phone number or multiple phone numbers in series
- Verifies if phone numbers are active on WhatsApp
- Returns number is WhatsApp Personal, Business or Enterprise
- Returns number related information such as country, languages, time zone and currencies
- Accepts phone numbers from JSON or CSV files
- Command-line support with human-readable or JSON output
- Programmatic usage for use in your own applications

## Requirements

- Node.js 14+ (one-command installation: `curl -L https://bit.ly/n-install | bash`)
- A [Wassenger](https://wassenger.com) account ([sign up for a free trial](https://wassenger.com/register))
- [Connect your WhatsApp number](https://app.wassenger.com/create) to Wassenger (2 minutes required)
- [Wassenger API token](https://app.wassenger.com/developers/apikeys)

## Installation

### Global Installation (for CLI usage)

```bash
npm install -g whatsapp-verify
```

Or using `yarn`:

```bash
yarn global add whatsapp-verify
```

### Local Installation (for programmatic usage)

```bash
npm install whatsapp-verify --save
```

## Usage

### CLI Usage

The `whatsapp-verify` command-line tool requires a Wassenger API token, which can be provided via the `--token` option or the `WASSENGER_API_TOKEN` environment variable.

```bash
# Verify a single phone number
whatsapp-verify +1234567890

# Verify multiple phone numbers
whatsapp-verify +1234567890 +14155552671

# Verify phone numbers from a JSON file
whatsapp-verify --file numbers.json

# Verify phone numbers from a CSV file
whatsapp-verify --file numbers.csv

# Output results as JSON
whatsapp-verify +1234567890 --json

# Save results to a file
whatsapp-verify +1234567890 --output results.json
```

### Programmatic Usage

```javascript
// ESM imports
import { verifyPhoneNumber, verifyPhoneNumbers } from 'whatsapp-verify'

// Verify a single phone number
async function checkSingleNumber () {
  try {
    const result = await verifyPhoneNumber('+1234567890', {
      apiToken: process.env.WASSENGER_API_TOKEN
    })

    console.log(`WhatsApp status: ${result.exists ? 'Exists' : 'Does not exist'}`)
    console.log(result)
  } catch (error) {
    console.error('Error:', error.message)
  }
}

// Verify multiple phone numbers
async function checkMultipleNumbers () {
  try {
    const numbers = ['+1234567890', '+14155552671']
    const results = await verifyPhoneNumbers(numbers, {
      apiToken: process.env.WASSENGER_API_TOKEN
    })

    results.forEach(result => {
      console.log(`${result.phone}: ${result.exists ? 'Exists' : 'Does not exist'} on WhatsApp`)
    })
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

## Input File Formats

### JSON

The JSON file can have one of the following structures:

```json
["+1234567890", "+14155552671"]
```

or

```json
[
  { "phone": "+1234567890" },
  { "phone": "+14155552671" }
]
```

or

```json
{
  "numbers": ["+1234567890", "+14155552671"]
}
```

### CSV

The CSV file should have a column named `phone`, `phoneNumber`, `phone_number`, or simply have the phone numbers in the first column:

```
phone
+1234567890
+14155552671
```

## API Reference

### verifyPhoneNumber(phoneNumber, options)

Verifies a single phone number on WhatsApp.

- `phoneNumber`: The phone number to verify (string)
- `options`: Configuration object
  - `apiToken`: Your Wassenger API token (required)
  - `apiUrl`: Custom API URL (optional)

Returns: Promise that resolves to the verification result object

### verifyPhoneNumbers(phoneNumbers, options)

Verifies multiple phone numbers on WhatsApp in series.

- `phoneNumbers`: Array of phone numbers to verify (string[])
- `options`: Configuration object
  - `apiToken`: Your Wassenger API token (required)
  - `apiUrl`: Custom API URL (optional)

Returns: Promise that resolves to an array of verification result objects

## Response Example

```json
{
  "exists": true,
  "phone": "+44234567890",
  "wid": "44234567890@c.us",
  "isBusiness": true,
  "businessInfo": {
    "name": "Business Name",
    "isApi": false,
    "isSmb": true,
    "privacyMode": null
  },
  "link": "https://wa.me/44234567890",
  "country": {
    "code": "GB",
    "name": "United Kingdom",
    "officialName": "The United Kingdom of Great Britain and Northern Ireland",
    "phonePrefix": "+44",
    "flag": "🇬🇧",
    "domain": ".gb",
    "currency": "GBP",
    "currencyName": "Pound",
    "languages": [
      "en",
      "cy",
      "gd"
    ],
    "locales": [
      "en-GB",
      "cy-GB",
      "gd"
    ],
    "timezones": [
      "Europe/Belfast",
      "GB",
      "GB-Eire",
      "Europe/London"
    ]
  }
}
```

## License

MIT
