import { View } from './view'

import { Secret } from '../domain/secret'

export class SecretView implements View {
  description: string = null
  key: string = null
  value: string = null

  constructor(s?: Secret) {
    if (!s) {
      return
    }
  }
}
