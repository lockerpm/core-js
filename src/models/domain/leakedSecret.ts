import { LeakedSecretData } from '../data/leakedSecretData'

import Domain from './domainBase'
import { EncString } from './encString'

import { LeakedSecretView } from '../view/leakedSecretView'
import { SymmetricCryptoKey } from './symmetricCryptoKey'

export class LeakedSecret extends Domain {
  description: EncString
  key: EncString
  value: EncString

  constructor(obj?: LeakedSecretData, alreadyEncrypted: boolean = false) {
    super()
    if (obj == null) {
      return
    }

    this.buildDomainModel(this, obj, {
      description: null,
      key: null,
      value: null,
    }, alreadyEncrypted, [])
  }

  decrypt(orgId: string, encKey?: SymmetricCryptoKey): Promise<LeakedSecretView> {
    return this.decryptObj(new LeakedSecretView(this), {
      description: null,
      key: null,
      value: null,
    }, orgId, encKey)
  }

  toLeakSecretData(): LeakedSecretData {
    const s = new LeakedSecretData()
    this.buildDataModel(this, s, {
      description: null,
      key: null,
      value: null,
    })
    return s
  }
}
