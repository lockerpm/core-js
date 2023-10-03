import { View } from './view'

import { Environment } from '../domain/environment'

export class EnvironmentView implements View {
  description: string = null
  name: string = null
  externalUrl: string = null

  constructor(s?: Environment) {
    if (!s) {
      return
    }
  }
}
