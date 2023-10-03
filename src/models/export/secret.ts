import { SecretView } from '../view/secretView'

import { Secret as SecretDomain } from '../domain/secret'
import { EncString } from '../domain/encString'

export class Secret {
  description: string
  key: string
  value: string

  static template(): Secret {
    const req = new Secret()
    req.description = ''
    req.key = ''
    req.value = ''
    return req
  }

  static toView(req: Secret, view = new SecretView()) {
    view.description = req.description
    view.key = req.key
    view.value = req.value
    return view
  }

  static toDomain(req: Secret, domain = new SecretDomain()) {
    domain.description = req.description != null ? new EncString(req.description) : null
    domain.key = req.key != null ? new EncString(req.key) : null
    domain.value = req.value != null ? new EncString(req.value) : null
    return domain
  }

    

  constructor(o?: SecretView | SecretDomain) {
    if (o == null) {
      return
    }

    if (o instanceof SecretView) {
      this.description = o.description
      this.key = o.key
      this.value = o.value
    } else {
      this.description = o.description?.encryptedString || ''
      this.key = o.key?.encryptedString || ''
      this.value = o.value?.encryptedString || ''
    }
  }
}
