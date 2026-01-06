import { LeakedSecretView } from '../view/leakedSecretView'

import { LeakedSecret as LeakedSecretDomain } from '../domain/leakedSecret'
import { EncString } from '../domain/encString'

export class LeakedSecret {
  description: string
  key: string
  value: string
  location: string
  lineInCode: string
  imageUrl: string
  commit: string

  static template(): LeakedSecret {
    const req = new LeakedSecret()
    req.description = ''
    req.key = ''
    req.value = ''
    req.location = ''
    req.lineInCode = ''
    req.imageUrl = ''
    req.commit = ''
    return req
  }

  static toView(req: LeakedSecret, view = new LeakedSecretView()) {
    view.description = req.description
    view.key = req.key
    view.value = req.value
    view.location = req.location
    view.lineInCode = req.lineInCode
    view.imageUrl = req.imageUrl
    view.commit = req.commit
    return view
  }

  static toDomain(req: LeakedSecret, domain = new LeakedSecretDomain()) {
    domain.description = req.description != null ? new EncString(req.description) : null
    domain.key = req.key != null ? new EncString(req.key) : null
    domain.value = req.value != null ? new EncString(req.value) : null
    domain.location = req.location != null ? new EncString(req.location) : null
    domain.lineInCode = req.lineInCode != null ? new EncString(req.lineInCode) : null
    domain.imageUrl = req.imageUrl != null ? new EncString(req.imageUrl) : null
    domain.commit = req.commit != null ? new EncString(req.commit) : null
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
      this.location = o.location
      this.lineInCode = o.lineInCode
      this.value = o.value
      this.description = o.description
    } else {
      this.description = o.description?.encryptedString || ''
      this.key = o.key?.encryptedString || ''
      this.value = o.value?.encryptedString || ''
      this.location = o.location?.encryptedString || ''
      this.lineInCode = o.lineInCode?.encryptedString || ''
      this.imageUrl = o.imageUrl?.encryptedString || ''
      this.commit = o.commit?.encryptedString || ''
    }
  }
}
