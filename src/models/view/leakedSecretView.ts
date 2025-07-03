import { View } from './view'

import { LeakedSecret } from '../domain/leakedSecret'

export class LeakedSecretView implements View {
  description: string = null
  key: string = null
  value: string = null

  constructor(s?: LeakedSecret) {
    if (!s) {
      return
    }
  }
}
