export interface StorageUploadResult {
  storageRef: string;
  url: string;
  fileSize: number;
}

export interface IStorageService {
  upload(file: Buffer, fileName: string, mimeType: string, folder: string): Promise<StorageUploadResult>;
  download(storageRef: string): Promise<Buffer>;
  getSignedUrl(storageRef: string, expiresInSeconds?: number): Promise<string>;
  delete(storageRef: string): Promise<void>;
  deleteMany(storageRefs: string[]): Promise<void>;
}

