import { BaseResponse } from '../response/baseResponse'

export class LeakedSecretApi extends BaseResponse {
  description: string
  key: string
  value: string
  location: string
  lineInCode: string
  imageUrl: string
  commit: string

  constructor(data: any = null) {
    super(data)
    if (data == null) {
      return
    }
    this.description = this.getResponseProperty('Description')
    this.key = this.getResponseProperty('Key')
    this.value = this.getResponseProperty('Value')
    this.location = this.getResponseProperty('Location')
    this.lineInCode = this.getResponseProperty('LineInCode')
    this.imageUrl = this.getResponseProperty('ImageUrl')
    this.commit = this.getResponseProperty('Commit')
  }
}
