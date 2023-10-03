import { SecretData } from '../data/secretData'

import Domain from './domainBase'
import { EncString } from './encString'

import { SecretView } from '../view/secretView'
import { SymmetricCryptoKey } from './symmetricCryptoKey'

export class Secret extends Domain {
  description: EncString
  key: EncString
  value: EncString

  constructor(obj?: SecretData, alreadyEncrypted: boolean = false) {
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

  decrypt(orgId: string, encKey?: SymmetricCryptoKey): Promise<SecretView> {
    return this.decryptObj(new SecretView(this), {
      description: null,
      key: null,
      value: null,
    }, orgId, encKey)
  }

  toSecretData(): SecretData {
    const s = new SecretData()
    this.buildDataModel(this, s, {
      description: null,
      key: null,
      value: null,
    })
    return s
  }
}
