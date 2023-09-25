import { ImportResult } from '../../src/models/domain/importResult'
import { BaseImporter } from './baseImporter'
import { Importer } from './importer'

export class ChromeCsvImporter extends BaseImporter implements Importer {
  parse (data: string): Promise<ImportResult> {
    const result = new ImportResult()
    const results = this.parseCsv(data, true)
    if (results == null) {
      result.success = false
      return Promise.resolve(result)
    }

    // CS
    const existingKeys = ['name', 'password', 'url', 'username']

    results.forEach(value => {
      const cipher = this.initLoginCipher()
      cipher.name = this.getValueOrDefault(value.name, '--')
      cipher.login.username = this.getValueOrDefault(value.username)
      cipher.login.password = this.getValueOrDefault(value.password)
      cipher.login.uris = this.makeUriArray(value.url)

      // CS
      Object.keys(value)
        .filter(k => !existingKeys.includes(k))
        .forEach(k => {
          this.processKvp(cipher, k, value[k])
        })

      this.cleanupCipher(cipher)
      result.ciphers.push(cipher)
    })

    result.success = true
    return Promise.resolve(result)
  }
}
