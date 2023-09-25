import { ImportResult } from '../../src/models/domain/importResult'
import { BaseImporter } from './baseImporter'
import { Importer } from './importer'

export class BlackBerryCsvImporter extends BaseImporter implements Importer {
  parse (data: string): Promise<ImportResult> {
    const result = new ImportResult()
    const results = this.parseCsv(data, true)
    if (results == null) {
      result.success = false
      return Promise.resolve(result)
    }

    // CS
    const existingKeys = [
      'grouping',
      'fav',
      'name',
      'extra',
      'url',
      'password',
      'username'
    ]

    results.forEach(value => {
      if (value.grouping === 'list') {
        return
      }
      const cipher = this.initLoginCipher()
      cipher.favorite = value.fav === '1'
      cipher.name = this.getValueOrDefault(value.name)
      cipher.notes = this.getValueOrDefault(value.extra)
      if (value.grouping !== 'note') {
        cipher.login.uris = this.makeUriArray(value.url)
        cipher.login.password = this.getValueOrDefault(value.password)
        cipher.login.username = this.getValueOrDefault(value.username)
      }

      // CS
      Object.keys(value)
        .filter(k => !existingKeys.includes(k))
        .forEach(k => {
          this.processKvp(cipher, k, value[k])
        })

      this.convertToNoteIfNeeded(cipher)
      this.cleanupCipher(cipher)
      result.ciphers.push(cipher)
    })

    result.success = true
    return Promise.resolve(result)
  }
}
