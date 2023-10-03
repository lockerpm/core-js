import { EnvironmentView } from '../view/environmentView'

import { Environment as EnvironmentDomain } from '../domain/environment'
import { EncString } from '../domain/encString'

export class Environment {
  description: string
  name: string
  externalUrl: string

  static template(): Environment {
    const req = new Environment()
    req.description = ''
    req.name = ''
    req.externalUrl = ''
    return req
  }

  static toView(req: Environment, view = new EnvironmentView()) {
    view.description = req.description
    view.name = req.name
    view.externalUrl = req.externalUrl
    return view
  }

  static toDomain(req: Environment, domain = new EnvironmentDomain()) {
    domain.description = req.description != null ? new EncString(req.description) : null
    domain.name = req.name != null ? new EncString(req.name) : null
    domain.externalUrl = req.externalUrl != null ? new EncString(req.externalUrl) : null
    return domain
  }

    

  constructor(o?: EnvironmentView | EnvironmentDomain) {
    if (o == null) {
      return
    }

    if (o instanceof EnvironmentView) {
      this.description = o.description
      this.name = o.name
      this.externalUrl = o.externalUrl
    } else {
      this.description = o.description?.encryptedString || ''
      this.name = o.name?.encryptedString || ''
      this.externalUrl = o.externalUrl?.encryptedString || ''
    }
  }
}
