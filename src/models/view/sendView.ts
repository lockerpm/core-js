import { Utils } from '../../../src/misc/utils'

import { Send } from '../domain/send'
import { SymmetricCryptoKey } from '../../../src/models/domain/symmetricCryptoKey'

import { View } from '../../../src/models/view'
import { CipherView } from './cipherView'

export class SendView implements View {
  id: string
  accessId: string
  creationDate: Date
  revisionDate: Date
  key: ArrayBuffer
  cryptoKey: SymmetricCryptoKey
  password: string
  maxAccessCount?: number
  accessCount: number = 0
  eachEmailAccessCount?: number
  expirationDate: Date
  disabled: boolean = false
  requireOtp: boolean = false
  cipherId: string
  cipher: CipherView
  emails: string[]

  constructor(s?: Send) {
    if (!s) {
      return
    }

    this.id = s.id
    this.accessId = s.accessId
    this.creationDate = s.creationDate
    this.revisionDate = s.revisionDate
    this.password = s.password
    this.maxAccessCount = s.maxAccessCount
    this.accessCount = s.accessCount
    this.eachEmailAccessCount = s.eachEmailAccessCount
    this.expirationDate = s.expirationDate
    this.disabled = s.disabled
    this.requireOtp = s.requireOtp
    this.cipherId = s.cipherId
    this.cipher = new CipherView(s.cipher)
    this.emails = s.emails
  }

  get urlB64Key(): string {
    return Utils.fromBufferToUrlB64(this.key)
  }

  get maxAccessCountReached(): boolean {
    if (this.maxAccessCount == null) {
      return false
    }
    return this.accessCount >= this.maxAccessCount
  }

  get expired(): boolean {
    if (this.expirationDate == null) {
      return false
    }
    return this.expirationDate <= new Date()
  }
}
