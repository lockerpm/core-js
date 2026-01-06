import { View } from './view'

import { LeakedSecret } from '../domain/leakedSecret'

export class LeakedSecretView implements View {
  description: string = null
  key: string = null
  value: string = null
  location: string = null
  lineInCode: string = null
  imageUrl: string = null
  commit: string = null

  constructor(s?: LeakedSecret) {
    if (!s) {
      return
    }
  }
}
