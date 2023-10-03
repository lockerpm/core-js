import { BaseResponse } from '../response/baseResponse'

export class EnvironmentApi extends BaseResponse {
  description: string
  name: string
  externalUrl: string

  constructor(data: any = null) {
    super(data)
    if (data == null) {
      return
    }
    this.description = this.getResponseProperty('Description')
    this.name = this.getResponseProperty('Name')
    this.externalUrl = this.getResponseProperty('ExternalUrl')
  }
}
