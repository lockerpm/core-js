export abstract class ExportService {
  getExport: (format?: 'csv' | 'json' | 'encrypted_json') => Promise<string>
  getOrganizationExport: (
    organizationId: string,
    format?: 'csv' | 'json' | 'encrypted_json'
  ) => Promise<string>
  getFileName: (prefix?: string, extension?: string) => string
}
