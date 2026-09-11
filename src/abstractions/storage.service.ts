export abstract class StorageService {
  init: () => Promise<any>
  get: <T>(key: string) => Promise<T>
  save: (key: string, obj: any) => Promise<any>
  remove: (key: string) => Promise<any>
}
