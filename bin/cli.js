#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import ora from 'ora'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { verifyPhoneNumbers } from '../lib/index.js'
import { parseInputFile } from '../lib/utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options] <phone_number...>')
  .example('$0 +1234567890', 'Verify a single phone number')
  .example('$0 +1234567890 +14155552671', 'Verify multiple phone numbers')
  .example('$0 --file numbers.json', 'Verify phone numbers from a JSON file')
  .example('$0 --file numbers.csv', 'Verify phone numbers from a CSV file')
  .option('file', {
    alias: 'f',
    describe: 'Input file with phone numbers (JSON or CSV)',
    type: 'string'
  })
  .option('token', {
    alias: 't',
    describe: 'Wassenger API token',
    type: 'string',
    default: process.env.WASSENGER_API_TOKEN
  })
  .option('json', {
    alias: 'j',
    describe: 'Output results as JSON',
    type: 'boolean',
    default: false
  })
  .option('output', {
    alias: 'o',
    describe: 'Save results to file',
    type: 'string'
  })
  .demandOption(['token'], 'Please provide an API token with --token or set WASSENGER_API_TOKEN environment variable')
  .help('h')
  .alias('h', 'help')
  .epilog('For more information visit https://github.com/wassengerhq/whatsapp-number-verify')
  .parse()

async function main () {
  const spinner = ora('Processing phone numbers...').start()
  try {
    let phoneNumbers = []

    // Get phone numbers from arguments or file
    if (argv.file) {
      spinner.text = `Reading phone numbers from ${argv.file}...`
      phoneNumbers = await parseInputFile(argv.file)
      spinner.text = `Verifying ${phoneNumbers.length} phone numbers from ${path.basename(argv.file)}...`
    } else if (argv._.length > 0) {
      phoneNumbers = argv._
      spinner.text = `Verifying ${phoneNumbers.length} phone number(s)...`
    } else {
      spinner.fail('No phone numbers provided')
      yargs().showHelp()
      process.exit(1)
    }

    // Verify phone numbers
    const results = await verifyPhoneNumbers(phoneNumbers, { apiToken: argv.token })
    spinner.succeed(`Successfully verified ${results.length} phone number(s)`)

    // Output results
    if (argv.json) {
      console.log(JSON.stringify(results, null, 2))
    } else {
      results.forEach(result => {
        const statusSymbol = result.exists ? chalk.green('✓') : chalk.red('✗')
        console.log(`\n${statusSymbol} Phone: ${chalk.bold(result.phone)}`)
        console.log(`  WhatsApp: ${result.exists ? chalk.green('Exists') : chalk.red('Does not exist')}`)

        if (result.exists) {
          console.log(`  WhatsApp ID: ${result.wid}`)
          console.log(`  Business: ${result.isBusiness ? chalk.yellow('Yes') : 'No'}`)

          if (result.isBusiness && result.businessInfo) {
            console.log('  Business Info:')
            console.log(`    Name: ${result.businessInfo.name || 'Unknown'}`)
            console.log(`    Type: ${result.businessInfo.isApi ? 'API' : (result.businessInfo.isSmb ? 'SMB' : 'Regular')}`)
          }

          if (result.country) {
            console.log(`  Country: ${result.country.flag} ${result.country.name} (${result.country.code})`)
          }
        }
      })
    }

    // Save to file if specified
    if (argv.output) {
      fs.writeFileSync(argv.output, JSON.stringify(results, null, 2))
      console.log(chalk.blue(`\nResults saved to ${argv.output}`))
    }
  } catch (error) {
    spinner.fail('Error verifying phone numbers')
    console.error(chalk.red(`\nError: ${error.message}`))
    process.exit(1)
  }
}

main()
