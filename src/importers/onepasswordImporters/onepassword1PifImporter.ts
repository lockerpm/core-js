import { BaseImporter } from '../baseImporter'
import { Importer } from '../importer'

import { ImportResult } from '../../../src/models/domain/importResult'

import { CardView } from '../../../src/models/view/cardView'
import { CipherView } from '../../../src/models/view/cipherView'
import { IdentityView } from '../../../src/models/view/identityView'
import { PasswordHistoryView } from '../../../src/models/view/passwordHistoryView'
import { SecureNoteView } from '../../../src/models/view/secureNoteView'

import { CipherType } from '../../../src/enums/cipherType'
import { FieldType } from '../../../src/enums/fieldType'
import { SecureNoteType } from '../../../src/enums/secureNoteType'

export class OnePassword1PifImporter extends BaseImporter implements Importer {
  result = new ImportResult()

  parse(data: string): Promise<ImportResult> {
    data.split(this.newLineRegex).forEach(line => {
      if (this.isNullOrWhitespace(line) || line[0] !== '{') {
        return
      }
      const item = JSON.parse(line)
      if (item.trashed === true) {
        return
      }
      const cipher = this.initLoginCipher()

      if (this.isNullOrWhitespace(item.hmac)) {
        this.processStandardItem(item, cipher)
      } else {
        this.processWinOpVaultItem(item, cipher)
      }

      this.convertToNoteIfNeeded(cipher)
      this.cleanupCipher(cipher)
      this.result.ciphers.push(cipher)
    })

    this.result.success = true
    return Promise.resolve(this.result)
  }

  private processWinOpVaultItem(item: any, cipher: CipherView) {
    if (item.overview != null) {
      cipher.name = this.getValueOrDefault(item.overview.title)
      if (item.overview.URLs != null) {
        const urls: string[] = []
        item.overview.URLs.forEach((url: any) => {
          if (!this.isNullOrWhitespace(url.u)) {
            urls.push(url.u)
          }
        })
        cipher.login.uris = this.makeUriArray(urls)
      }
    }

    if (item.details != null) {
      if (item.details.passwordHistory != null) {
        this.parsePasswordHistory(item.details.passwordHistory, cipher)
      }
      if (
        !this.isNullOrWhitespace(item.details.ccnum) ||
        !this.isNullOrWhitespace(item.details.cvv)
      ) {
        cipher.type = CipherType.Card
        cipher.card = new CardView()
      } else if (
        !this.isNullOrWhitespace(item.details.firstname) ||
        !this.isNullOrWhitespace(item.details.address1)
      ) {
        cipher.type = CipherType.Identity
        cipher.identity = new IdentityView()
      }
      if (cipher.type === CipherType.Login && !this.isNullOrWhitespace(item.details.password)) {
        cipher.login.password = item.details.password
      }
      if (!this.isNullOrWhitespace(item.details.notesPlain)) {
        cipher.notes = item.details.notesPlain.split(this.newLineRegex).join('\n') + '\n'
      }
      if (item.details.fields != null) {
        this.parseFields(item.details.fields, cipher, 'designation', 'value', 'name')
      }
      if (item.details.sections != null) {
        item.details.sections.forEach((section: any) => {
          if (section.fields != null) {
            this.parseFields(section.fields, cipher, 'n', 'v', 't')
          }
        })
      }
    }
  }

  private processStandardItem(item: any, cipher: CipherView) {
    cipher.favorite = !!(item.openContents && item.openContents.faveIndex)

    // CS
    if (item.openContents) {
      const existingKeys = ['faveIndex']
      Object.keys(item.openContents)
        .filter(k => !existingKeys.includes(k))
        .forEach(k => {
          this.processKvp(cipher, k, item.openContents[k])
        })
    }

    // CS
    const existingKeys = [
      'passwordHistory',
      'notesPlain',
      'password',
      'URLs',
      'fields',
      'sections',
      'unknown_overview',
      'unknown_details',
      'username'
    ]

    cipher.name = this.getValueOrDefault(item.title)

    if (item.typeName === 'securenotes.SecureNote') {
      cipher.type = CipherType.SecureNote
      cipher.secureNote = new SecureNoteView()
      cipher.secureNote.type = SecureNoteType.Generic
    } else if (item.typeName === 'wallet.financial.CreditCard') {
      cipher.type = CipherType.Card
      cipher.card = new CardView()
    } else if (item.typeName === 'identities.Identity') {
      cipher.type = CipherType.Identity
      cipher.identity = new IdentityView()
    } else if (item.typeName === 'wallet.computer.UnixServer') {
      existingKeys.push('admin_console_url', 'name', 'website', 'url')
    } else {
      cipher.login.uris = this.makeUriArray(item.location)
    }

    if (item.secureContents != null) {
      if (item.secureContents.passwordHistory != null) {
        this.parsePasswordHistory(item.secureContents.passwordHistory, cipher)
      }
      if (!this.isNullOrWhitespace(item.secureContents.notesPlain)) {
        cipher.notes = item.secureContents.notesPlain.split(this.newLineRegex).join('\n') + '\n'
      }
      if (cipher.type === CipherType.Login) {
        if (!this.isNullOrWhitespace(item.secureContents.password)) {
          cipher.login.password = item.secureContents.password
        }
        if (!this.isNullOrWhitespace(item.secureContents.username)) {
          cipher.login.username = item.secureContents.username
        }
        if (item.secureContents.URLs != null) {
          const urls: string[] = []
          item.secureContents.URLs.forEach((u: any) => {
            if (!this.isNullOrWhitespace(u.url)) {
              urls.push(u.url)
            }
          })
          if (urls.length > 0) {
            cipher.login.uris = this.makeUriArray(urls)
          }
        }
      }
      if (item.secureContents.fields != null) {
        this.parseFields(item.secureContents.fields, cipher, 'designation', 'value', 'name')
      }
      if (item.secureContents.sections != null) {
        item.secureContents.sections.forEach((section: any) => {
          if (section.fields != null) {
            this.parseFields(section.fields, cipher, 'n', 'v', 't')
          }
        })
      }

      // CS
      if (item.secureContents.unknown_details) {
        if (item.secureContents.unknown_details.sections != null) {
          item.secureContents.unknown_details.sections.forEach((section: any) => {
            if (section.fields != null) {
              this.parseFields(section.fields, cipher, 'n', 'v', 't')
            }
          })
        }
      }

      // CS
      Object.keys(item.secureContents)
        .filter(k => !existingKeys.includes(k))
        .forEach(k => {
          this.processKvp(cipher, k, item.secureContents[k])
        })
    }
  }

  private parsePasswordHistory(items: any[], cipher: CipherView) {
    const maxSize = items.length > 5 ? 5 : items.length
    cipher.passwordHistory = items
      .filter((h: any) => !this.isNullOrWhitespace(h.value) && h.time != null)
      .sort((a, b) => b.time - a.time)
      .slice(0, maxSize)
      .map((h: any) => {
        const ph = new PasswordHistoryView()
        ph.password = h.value
        ph.lastUsedDate = new Date(('' + h.time).length >= 13 ? h.time : h.time * 1000)
        return ph
      })
  }

  private parseFields(
    fields: any[],
    cipher: CipherView,
    designationKey: string,
    valueKey: string,
    nameKey: string
  ) {
    fields.forEach((field: any) => {
      if (field[valueKey] == null || field[valueKey].toString().trim() === '') {
        return
      }

      let fieldValue = field[valueKey].toString()
      const fieldDesignation =
        field[designationKey] != null ? field[designationKey].toString() : null

      if (cipher.type === CipherType.Login) {
        if (fieldDesignation === 'username') {
          if (this.isNullOrWhitespace(cipher.login.username)) {
            cipher.login.username = fieldValue
            return
          } else if ((cipher.login.username = fieldValue)) {
            return
          }
        } else if (['password', 'credential'].includes(fieldDesignation)) {
          // CS
          if (this.isNullOrWhitespace(cipher.login.password)) {
            cipher.login.password = fieldValue
            return
          } else if (cipher.login.password === fieldValue) {
            return
          }
        } else if (fieldDesignation === 'website') {
          if (!cipher.login.hasUris) {
            cipher.login.uris = this.makeUriArray([fieldValue])
            return
          } else if (cipher.login.uri === this.fixUri(fieldValue)) {
            return
          }
        } else if (fieldDesignation === 'url') {
          if (!cipher.login.hasUris) {
            cipher.login.uris = this.makeUriArray([fieldValue])
            return
          } else if (cipher.login.uri === this.fixUri(fieldValue)) {
            return
          }
        } else if (
          this.isNullOrWhitespace(cipher.login.totp) &&
          fieldDesignation != null &&
          fieldDesignation.startsWith('TOTP_')
        ) {
          cipher.login.totp = fieldValue
          return
        }
      } else if (cipher.type === CipherType.Card) {
        if (this.isNullOrWhitespace(cipher.card.number) && fieldDesignation === 'ccnum') {
          cipher.card.number = fieldValue
          cipher.card.brand = this.getCardBrand(fieldValue)!
          return
        } else if (this.isNullOrWhitespace(cipher.card.code) && fieldDesignation === 'cvv') {
          cipher.card.code = fieldValue
          return
        } else if (
          this.isNullOrWhitespace(cipher.card.cardholderName) &&
          fieldDesignation === 'cardholder'
        ) {
          cipher.card.cardholderName = fieldValue
          return
        } else if (
          this.isNullOrWhitespace(cipher.card.expiration) &&
          fieldDesignation === 'expiry' &&
          fieldValue.length === 6
        ) {
          cipher.card.expMonth = (fieldValue as string).substr(4, 2)
          if (cipher.card.expMonth[0] === '0') {
            cipher.card.expMonth = cipher.card.expMonth.substr(1, 1)
          }
          cipher.card.expYear = (fieldValue as string).substr(0, 4)
          return
        } else if (fieldDesignation === 'type') {
          // Skip since brand was determined from number above
          return
        }
      } else if (cipher.type === CipherType.Identity) {
        const identity = cipher.identity
        if (this.isNullOrWhitespace(identity.firstName) && fieldDesignation === 'firstname') {
          identity.firstName = fieldValue
          return
        } else if (this.isNullOrWhitespace(identity.lastName) && fieldDesignation === 'lastname') {
          identity.lastName = fieldValue
          return
        } else if (this.isNullOrWhitespace(identity.middleName) && fieldDesignation === 'initial') {
          identity.middleName = fieldValue
          return
        } else if (this.isNullOrWhitespace(identity.phone) && fieldDesignation === 'defphone') {
          identity.phone = fieldValue
          return
        } else if (this.isNullOrWhitespace(identity.company) && fieldDesignation === 'company') {
          identity.company = fieldValue
          return
        } else if (this.isNullOrWhitespace(identity.email) && fieldDesignation === 'email') {
          identity.email = fieldValue
          return
        } else if (this.isNullOrWhitespace(identity.username) && fieldDesignation === 'username') {
          identity.username = fieldValue
          return
        } else if (fieldDesignation === 'address') {
          // fieldValue is an object casted into a string, so access the plain value instead
          const { street, city, country, zip } = field[valueKey]
          identity.address1 = this.getValueOrDefault(street)
          identity.city = this.getValueOrDefault(city)
          if (!this.isNullOrWhitespace(country)) {
            identity.country = country.toUpperCase()
          }
          identity.postalCode = this.getValueOrDefault(zip)
          return
        }
      }

      const fieldName = this.isNullOrWhitespace(field[nameKey]) ? 'no_name' : field[nameKey]
      if (
        fieldName === 'password' &&
        cipher.passwordHistory != null &&
        cipher.passwordHistory.some(h => h.password === fieldValue)
      ) {
        return
      }

      // CS
      let fieldType: FieldType
      if (field.k === 'concealed') {
        fieldType = FieldType.Hidden
      } else if (field.k === 'date') {
        fieldType = FieldType.Date
        fieldValue += '000'
      } else if (field.k === 'URL') {
        fieldType = FieldType.URL
      } else if (field.k === 'address') {
        fieldType = FieldType.Address
      } else {
        fieldType = FieldType.Text
      }

      // const fieldType = field.k === 'concealed' ? FieldType.Hidden : FieldType.Text;
      this.processKvp(cipher, fieldName, fieldValue, fieldType)
    })
  }
}
