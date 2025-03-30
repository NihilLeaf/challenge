export default interface IAdditionalDataReturn {
  url: string
  bytes: number
  extraField?: string
  metadata?: Record<string, unknown>
}
