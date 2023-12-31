import { CipherView } from '../../../src/models/view'

export class CipherImportContext {
  lowerProperty: string
  constructor(public importRecord: any, public property: string, public cipher: CipherView) {
    this.lowerProperty = property.toLowerCase()
  }
}
