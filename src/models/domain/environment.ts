import { EnvironmentData } from '../data/environmentData'

import Domain from './domainBase'
import { EncString } from './encString'

import { EnvironmentView } from '../view/environmentView'
import { SymmetricCryptoKey } from './symmetricCryptoKey'

export class Environment extends Domain {
  description: EncString
  name: EncString
  externalUrl: EncString

  constructor(obj?: EnvironmentData, alreadyEncrypted: boolean = false) {
    super()
    if (obj == null) {
      return
    }

    this.buildDomainModel(this, obj, {
      description: null,
      name: null,
      externalUrl: null,
    }, alreadyEncrypted, [])
  }

  decrypt(orgId: string, encKey?: SymmetricCryptoKey): Promise<EnvironmentView> {
    return this.decryptObj(new EnvironmentView(this), {
      description: null,
      name: null,
      externalUrl: null,
    }, orgId, encKey)
  }

  toEnvironmentData(): EnvironmentData {
    const s = new EnvironmentData()
    this.buildDataModel(this, s, {
      description: null,
      name: null,
      externalUrl: null,
    })
    return s
  }
}
