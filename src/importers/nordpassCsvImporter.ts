import { ImportResult } from '../../src/models/domain/importResult'

import { CipherView } from '../../src/models/view/cipherView'
import { LoginView } from '../../src/models/view/loginView'

import { CipherType } from '../../src/enums/cipherType'
import { SecureNoteType } from '../../src/enums/secureNoteType'
import { Importer } from './importer'
import { BaseImporter } from './baseImporter'

type nodePassCsvParsed = {
  name: string
  url: string
  username: string
  password: string
  note: string
  cardholdername: string
  cardnumber: string
  cvc: string
  expirydate: string
  zipcode: string
  folder: string
  full_name: string
  phone_number: string
  email: string
  address1: string
  address2: string
  city: string
  country: string
  state: string
}

export class NordPassCsvImporter extends BaseImporter implements Importer {
  parse (data: string): Promise<ImportResult> {
    const result = new ImportResult()
    const results: nodePassCsvParsed[] = this.parseCsv(data, true)
    if (results == null) {
      result.success = false
      return Promise.resolve(result)
    }

    results.forEach(record => {
      const recordType = this.evaluateType(record)
      if (recordType === undefined) {
        return
      }

      if (!this.organization) {
        this.processFolder(result, record.folder)
      }

      const cipher = new CipherView()
      cipher.name = this.getValueOrDefault(record.name, '--')
      cipher.notes = this.getValueOrDefault(record.note)

      // CS
      const existingKeys = ['name', 'note', 'folder']

      switch (recordType) {
      case CipherType.Login:
        cipher.type = CipherType.Login
        cipher.login = new LoginView()
        cipher.login.username = this.getValueOrDefault(record.username)
        cipher.login.password = this.getValueOrDefault(record.password)
        cipher.login.uris = this.makeUriArray(record.url)
        existingKeys.push('username', 'password', 'url')
        break
      case CipherType.Card:
        cipher.type = CipherType.Card
        cipher.card.cardholderName = this.getValueOrDefault(
          record.cardholdername
        )
        cipher.card.number = this.getValueOrDefault(record.cardnumber)
        cipher.card.code = this.getValueOrDefault(record.cvc)
        cipher.card.brand = this.getCardBrand(cipher.card.number)
        this.setCardExpiration(cipher, record.expirydate)
        existingKeys.push('cardholdername', 'cardnumber', 'cvc', 'expirydate')
        break
      case CipherType.Identity:
        cipher.type = CipherType.Identity

        this.processName(cipher, this.getValueOrDefault(record.full_name))
        cipher.identity.address1 = this.getValueOrDefault(record.address1)
        cipher.identity.address2 = this.getValueOrDefault(record.address2)
        cipher.identity.city = this.getValueOrDefault(record.city)
        cipher.identity.state = this.getValueOrDefault(record.state)
        cipher.identity.postalCode = this.getValueOrDefault(record.zipcode)
        cipher.identity.country = this.getValueOrDefault(record.country)
        if (cipher.identity.country != null) {
          cipher.identity.country = cipher.identity.country.toUpperCase()
        }
        cipher.identity.email = this.getValueOrDefault(record.email)
        cipher.identity.phone = this.getValueOrDefault(record.phone_number)
        existingKeys.push(
          'full_name',
          'address1',
          'address2',
          'city',
          'state',
          'zipcode',
          'country',
          'email',
          'phone_number'
        )
        break
      case CipherType.SecureNote:
        cipher.type = CipherType.SecureNote
        cipher.secureNote.type = SecureNoteType.Generic
        break
      default:
        break
      }

      // CS
      Object.keys(record)
        .filter(k => !existingKeys.includes(k))
        .forEach(k => {
          this.processKvp(cipher, k, record[k])
        })

      this.cleanupCipher(cipher)
      result.ciphers.push(cipher)
    })

    if (this.organization) {
      this.moveFoldersToCollections(result)
    }

    result.success = true
    return Promise.resolve(result)
  }

  private evaluateType (record: nodePassCsvParsed): CipherType {
    if (!this.isNullOrWhitespace(record.username)) {
      return CipherType.Login
    }

    if (!this.isNullOrWhitespace(record.cardnumber)) {
      return CipherType.Card
    }

    if (!this.isNullOrWhitespace(record.full_name)) {
      return CipherType.Identity
    }

    if (!this.isNullOrWhitespace(record.note)) {
      return CipherType.SecureNote
    }

    return undefined
  }

  private processName (cipher: CipherView, fullName: string) {
    if (this.isNullOrWhitespace(fullName)) {
      return
    }

    const nameParts = fullName.split(' ')
    if (nameParts.length > 0) {
      cipher.identity.firstName = this.getValueOrDefault(nameParts[0])
    }
    if (nameParts.length === 2) {
      cipher.identity.lastName = this.getValueOrDefault(nameParts[1])
    } else if (nameParts.length >= 3) {
      cipher.identity.middleName = this.getValueOrDefault(nameParts[1])
      cipher.identity.lastName = nameParts.slice(2, nameParts.length).join(' ')
    }
  }
}
