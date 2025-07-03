import { LeakedSecretView } from '../view/leakedSecretView'

import { LeakedSecret as LeakedSecretDomain } from '../domain/leakedSecret'
import { EncString } from '../domain/encString'

export class LeakedSecret {
  description: string
  key: string
  value: string

  static template(): LeakedSecret {
    const req = new LeakedSecret()
    req.description = ''
    req.key = ''
    req.value = ''
    return req
  }

  static toView(req: LeakedSecret, view = new LeakedSecretView()) {
    view.description = req.description
    view.key = req.key
    view.value = req.value
    return view
  }

  static toDomain(req: LeakedSecret, domain = new LeakedSecretDomain()) {
    domain.description = req.description != null ? new EncString(req.description) : null
    domain.key = req.key != null ? new EncString(req.key) : null
    domain.value = req.value != null ? new EncString(req.value) : null
    return domain
  }

    

  constructor(o?: LeakedSecretView | LeakedSecretDomain) {
    if (o == null) {
      return
    }

    if (o instanceof LeakedSecretView) {
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
