import { CollectionData } from '../models/data/collectionData'

import { Collection } from '../models/domain/collection'
import { TreeNode } from '../../src/models/domain/treeNode'

import { CollectionView } from '../models/view/collectionView'

import { CollectionService as CollectionServiceAbstraction } from '../../src/abstractions/collection.service'
import { CryptoService } from '../../src/abstractions/crypto.service'
import { I18nService } from '../../src/abstractions/i18n.service'
import { StorageService } from '../../src/abstractions/storage.service'
import { UserService } from '../../src/abstractions/user.service'

import { ServiceUtils } from '../../src/misc/serviceUtils'
import { Utils } from '../../src/misc/utils'

const Keys = {
  collectionsPrefix: 'collections_',
}
const NestingDelimiter = '/'

export class CollectionService implements CollectionServiceAbstraction {
  decryptedCollectionCache: CollectionView[]

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private cryptoService: CryptoService,
    private userService: UserService,
    private storageService: StorageService,
    private i18nService: I18nService
  ) {}

  clearCache(): void {
    this.decryptedCollectionCache = null
  }

  async encrypt(model: CollectionView): Promise<Collection> {
    if (model.organizationId == null) {
      throw new Error('Collection has no organization id.')
    }
    const key = await this.cryptoService.getOrgKey(model.organizationId)
    if (key == null) {
      throw new Error('No key for this collection\'s organization.')
    }
    const collection = new Collection()
    collection.id = model.id
    collection.organizationId = model.organizationId
    collection.readOnly = model.readOnly
    collection.name = await this.cryptoService.encrypt(model.name, key)
    return collection
  }

  async decryptMany(collections: Collection[]): Promise<CollectionView[]> {
    if (collections == null) {
      return []
    }
    const decCollections: CollectionView[] = []
    const promises: Promise<any>[] = []
    collections.forEach(collection => {
      promises.push(collection.decrypt().then(c => decCollections.push(c)))
    })
    await Promise.all(promises)
    return decCollections.sort(Utils.getSortFunction(this.i18nService, 'name'))
  }

  async get(id: string): Promise<Collection> {
    const userId = await this.userService.getUserId()
    const collections = await this.storageService.get<{
      [id: string]: CollectionData;
    }>(Keys.collectionsPrefix + userId)
    if (collections == null || !collections.hasOwnProperty(id)) {
      return null
    }

    return new Collection(collections[id])
  }

  async getAll(): Promise<Collection[]> {
    const userId = await this.userService.getUserId()
    const collections = await this.storageService.get<{
      [id: string]: CollectionData;
    }>(Keys.collectionsPrefix + userId)
    const response: Collection[] = []
    for (const id in collections) {
      if (collections.hasOwnProperty(id)) {
        response.push(new Collection(collections[id]))
      }
    }
    return response
  }

  async getAllDecrypted(): Promise<CollectionView[]> {
    let decCollections: CollectionView[] = []

    if (this.decryptedCollectionCache != null) {
      // Filter invalid collection to decrypt again
      decCollections = this.decryptedCollectionCache.filter(c => !!c.name)
    }

    const hasKey = await this.cryptoService.hasKey()
    if (!hasKey) {
      throw new Error('No key.')
    }

    let collections = await this.getAll()

    // only decrypt what is not decrypted
    const decryptedCollectionIds = decCollections.map(c => c.id)
    collections = collections.filter(c => !decryptedCollectionIds.includes(c.id))

    const newlyDecrypted = await this.decryptMany(collections)
    this.decryptedCollectionCache = [...decCollections, ...newlyDecrypted].sort(Utils.getSortFunction(this.i18nService, 'name'))

    return this.decryptedCollectionCache
  }

  async getAllNested(collections: CollectionView[] = null): Promise<TreeNode<CollectionView>[]> {
    if (collections == null) {
      collections = await this.getAllDecrypted()
    }
    const nodes: TreeNode<CollectionView>[] = []
    collections.forEach(c => {
      const collectionCopy = new CollectionView()
      collectionCopy.id = c.id
      collectionCopy.organizationId = c.organizationId
      const parts = c.name != null ? c.name.replace(/^\/+|\/+$/g, '').split(NestingDelimiter) : []
      ServiceUtils.nestedTraverse(nodes, 0, parts, collectionCopy, null, NestingDelimiter)
    })
    return nodes
  }

  async getNested(id: string): Promise<TreeNode<CollectionView>> {
    const collections = await this.getAllNested()
    return ServiceUtils.getTreeNodeObject(collections, id) as TreeNode<CollectionView>
  }

  async upsert(collection: CollectionData | CollectionData[]): Promise<any> {
    const userId = await this.userService.getUserId()
    let collections = await this.storageService.get<{
      [id: string]: CollectionData;
    }>(Keys.collectionsPrefix + userId)
    if (collections == null) {
      collections = {}
    }

    if (collection instanceof CollectionData) {
      const c = collection as CollectionData
      collections[c.id] = c
    } else {
      (collection as CollectionData[]).forEach(c => {
        collections[c.id] = c
      })
    }

    await this.storageService.save(Keys.collectionsPrefix + userId, collections)
    this.decryptedCollectionCache = null
  }

  async replace(collections: { [id: string]: CollectionData }): Promise<any> {
    const userId = await this.userService.getUserId()
    await this.storageService.save(Keys.collectionsPrefix + userId, collections)
    this.decryptedCollectionCache = null
  }

  async clear(userId: string): Promise<any> {
    await this.storageService.remove(Keys.collectionsPrefix + userId)
    this.decryptedCollectionCache = null
  }

  async delete(id: string | string[]): Promise<any> {
    const userId = await this.userService.getUserId()
    const collections = await this.storageService.get<{
      [id: string]: CollectionData;
    }>(Keys.collectionsPrefix + userId)
    if (collections == null) {
      return
    }

    if (typeof id === 'string') {
      const i = id as string
      delete collections[id]
    } else {
      (id as string[]).forEach(i => {
        delete collections[i]
      })
    }

    await this.storageService.save(Keys.collectionsPrefix + userId, collections)
    this.decryptedCollectionCache = null
  }
}
