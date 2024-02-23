import { BaseImporter } from '../baseImporter'
import { Importer } from '../importer'

import { ImportResult } from '../../models/domain/importResult'

import { CardView } from '../../models/view/cardView'
import { CipherView } from '../../models/view/cipherView'
import { IdentityView } from '../../models/view/identityView'
import { SecureNoteView } from '../../models/view/secureNoteView'

import { CipherType } from '../../enums/cipherType'
import { FieldType } from '../../enums/fieldType'
import { SecureNoteType } from '../../enums/secureNoteType'
import { LoginView } from '../../models/view'

enum Category {
  Password = '001',
  Identity = '004',
  Note = '003',
  CryptoWallet = '115',
  Card = '002',

  // Nope
  BankAccount = '101',
  Membership = '105'
}

// Only care about important data, extract the file to see full data
type DataFormat = {
  accounts: {
    attrs: {
      name: string
    }
    vaults: {
      attrs: {
        name: string
      }
      items: {
        categoryUuid: Category | string
        details: {
          loginFields: {
            value: string
            name: string
            fieldType: 'T' | 'P'
            designation: 'username' | 'password'
          }[]
          sections: {
            title: string
            name: string
            fields: {
              title: string
              id: 'firstname' | 'initial' | 'lastname' 
                | 'gender' | 'birthdate' | 'occupation' | 'company' 
                | 'department' | 'jobtitle' | 'address' | 'defphone' 
                | 'homephone' | 'cellphone' | 'busphone' | 'email' | 'phone'
                | 'member_name' | 'recoveryPhrase' | 'password' | 'walletAddress'
                | 'bankName' | 'owner' | 'accountNo' | 'cardholder' | 'ccnum' | 'cvv'
                | 'expiry' | 'validFrom' | 'bank' | 'pin' | string
              value: {
                string?: 'Fe' | 'Ma' | string
                date?: number
                address?: {
                  street: string
                  city: string
                  country: string
                  zip: string
                  state: string
                }
                phone?: string
                url?: string
                monthYear?: number // MMYYYY
                concealed?: string
                menu?: string
                creditCardType?: string
                creditCardNumber?: string
              }
            }[]
          }[]
          notesPlain?: string
        }
        overview: {
          title: string
          subtitle: string
          url: string
          tags?: string[]
        }
      }[]
    }[]
  }[]
}

export class OnePassword1PuxImporter extends BaseImporter implements Importer {
  parse(data: string): Promise<ImportResult> {
    const result = new ImportResult()

    try {
      const parsed: DataFormat = JSON.parse(data)
      parsed.accounts.forEach(account => {
        account.vaults.forEach(vault => {
          vault.items.forEach(item => {
            this.processFolder(result, `${account.attrs.name}-${vault.attrs.name}`)

            // Basic info
            const cipher = this.initLoginCipher()
            cipher.name = item.overview.title
            cipher.notes = item.details.notesPlain
            this.processKvp(cipher, 'subtitle', item.overview.subtitle)
            this.processKvp(cipher, 'tags', item.overview.tags?.join(', '))

            // Parse by category
            switch (item.categoryUuid) {
              case Category.Password: {
                this.processLoginFields(cipher, item.details.loginFields)
                this.processSections(cipher, item.details.sections)
                if (cipher.login) {
                  cipher.login.uris = this.makeUriArray(item.overview.url)
                }
                break
              }

              case Category.Identity: {
                const usedKeyIds = ['firstname', 'lastname', 'initial', 'address', 'company', 'email', 'defphone']
                cipher.type = CipherType.Identity
                cipher.identity = new IdentityView()
                cipher.identity.firstName = this.getValueByKeyId('firstname', item.details.sections)?.string
                cipher.identity.lastName = this.getValueByKeyId('lastname', item.details.sections)?.string
                cipher.identity.middleName = this.getValueByKeyId('initial', item.details.sections)?.string
                const address = this.getValueByKeyId('address', item.details.sections)?.address
                if (address) {
                  cipher.identity.state = address.state
                  cipher.identity.city = address.city
                  cipher.identity.country = address.country
                  cipher.identity.postalCode = address.zip
                  cipher.identity.address1 = address.street
                }
                cipher.identity.company = this.getValueByKeyId('company', item.details.sections)?.string
                cipher.identity.email = this.getValueByKeyId('email', item.details.sections)?.string
                cipher.identity.licenseNumber = ''
                cipher.identity.passportNumber = ''
                cipher.identity.phone = this.getValueByKeyId('defphone', item.details.sections)?.phone
                cipher.identity.ssn = ''
                this.processSections(cipher, item.details.sections, usedKeyIds)
                break
              }

              case Category.CryptoWallet: {
                const usedKeyIds = ['password', 'pin', 'walletAddress', 'recoveryPhrase']
                cipher.type = CipherType.CryptoWallet
                const cryptoWallet = {
                  password: this.getValueByKeyId('password', item.details.sections)?.concealed,
                  pin: this.getValueByKeyId('pin', item.details.sections)?.concealed,
                  address: this.getValueByKeyId('walletAddress', item.details.sections)?.string,
                  seed: this.getValueByKeyId('recoveryPhrase', item.details.sections)?.concealed,
                  notes: cipher.notes
                }
                cipher.notes = JSON.stringify(cryptoWallet)
                this.processSections(cipher, item.details.sections, usedKeyIds)
                break
              }

              case Category.Card: {
                const usedKeyIds = ['cardholder', 'cvv', 'expiry', 'ccnum']
                cipher.type = CipherType.Card
                cipher.card = new CardView()
                cipher.card.cardholderName = this.getValueByKeyId('cardholder', item.details.sections)?.string
                cipher.card.code = this.getValueByKeyId('cvv', item.details.sections)?.concealed
                const expiryDate = this.getValueByKeyId('expiry', item.details.sections)?.monthYear?.toString()
                if (expiryDate) {
                  cipher.card.expMonth = expiryDate.slice(0, 2)
                  cipher.card.expYear = expiryDate.slice(2)
                }
                cipher.card.number = this.getValueByKeyId('ccnum', item.details.sections)?.creditCardNumber
                cipher.card.brand = this.getCardBrand(cipher.card.number)
                this.processSections(cipher, item.details.sections, usedKeyIds)
                break
              }

              default: {
                if (item.details.loginFields?.length) {
                  this.processLoginFields(cipher, item.details.loginFields)
                } else {
                  cipher.type = CipherType.SecureNote
                  cipher.secureNote = new SecureNoteView()
                  cipher.secureNote.type = SecureNoteType.Generic
                }
                this.processSections(cipher, item.details.sections)
              }
            }
            
            this.convertToNoteIfNeeded(cipher)
            this.cleanupCipher(cipher)
            result.ciphers.push(cipher)
          })
        })
      })
      result.success = true
    } catch (error) {
      console.error('1pux importer', error)
    }

    return Promise.resolve(result)
  }

  private processLoginFields(cipher: CipherView, loginFields: DataFormat['accounts'][0]['vaults'][0]['items'][0]['details']['loginFields']) {
    cipher.login = new LoginView()
    loginFields.forEach(field => {
      if (field.designation === 'username') {
        cipher.login.username = field.value
      } else if (field.designation === 'password') {
        cipher.login.password = field.value
      } else {
        this.processKvp(cipher, field.name, field.value, field.fieldType === 'P' ? FieldType.Hidden : FieldType.Text)
      }
    })
  }

  private processSections(
    cipher: CipherView, 
    sections: DataFormat['accounts'][0]['vaults'][0]['items'][0]['details']['sections'],
    ignoredKeyIds: string[] = []
  ) {
    sections.forEach(section => {
      section.fields.forEach(field => {
        if (ignoredKeyIds.includes(field.id)) {
          return
        }
        let value: string = field.value.string 
          || field.value.phone 
          || field.value.url 
          || field.value.menu 
          || field.value.creditCardType
          || field.value.creditCardNumber
          || field.value.concealed
        let type = FieldType.Text
        if (field.value.date) {
          const date = new Date(field.value.date * 1000)
          const day = ('0' + date.getDate()).slice(-2)
          const month = ('0' + (date.getMonth() + 1)).slice(-2)
          const year = date.getFullYear();
          value = `${day}/${month}/${year}`
        }
        if (field.value.address) {
          Object.keys(field.value.address).forEach(key => {
            this.processKvp(cipher, key, field.value.address[key])
          })
          return
        }
        if (field.value.monthYear) {
          value = `${field.value.monthYear.toString().slice(0, 2)}/${field.value.monthYear.toString().slice(2)}`
        }
        if (field.value.concealed) {
          type = FieldType.Hidden
        }
        this.processKvp(cipher, field.title, value, type)
      })
    })
  }

  private getValueByKeyId(
    id: string, 
    sections: DataFormat['accounts'][0]['vaults'][0]['items'][0]['details']['sections']
  ) {
    for (const section of sections) {
      for (const field of section.fields) {
        if (field.id === id) {
          return field.value
        }
      }
    }
    return null
  }
}
