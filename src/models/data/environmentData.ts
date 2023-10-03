import { EnvironmentApi } from '../api/environmentApi'

export class EnvironmentData {
  description: string
  name: string
  externalUrl: string

  constructor(data?: EnvironmentApi) {
    if (data == null) {
      return
    }

    this.description = data.description
    this.name = data.name
    this.externalUrl = data.externalUrl
  }
}
