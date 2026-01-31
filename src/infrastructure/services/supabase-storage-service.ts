import { IStorageService, StorageUploadResult } from '@domain/interfaces/storage-service';
import { getSupabaseServiceClient } from '../database/supabase-client';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseStorageService implements IStorageService {
  private bucketName = 'documents';

  async upload(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder: string
  ): Promise<StorageUploadResult> {
    const supabase = getSupabaseServiceClient();
    
    const extension = fileName.split('.').pop() || '';
    const uniqueFileName = `${uuidv4()}.${extension}`;
    const storageRef = `${folder}/${uniqueFileName}`;

    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(storageRef, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw new Error(`Failed to upload file: ${error.message}`);

    const { data: urlData } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(storageRef);

    return {
      storageRef,
      url: urlData.publicUrl,
      fileSize: file.length,
    };
  }

  async getSignedUrl(storageRef: string, expiresInSeconds = 3600): Promise<string> {
    const supabase = getSupabaseServiceClient();
    
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(storageRef, expiresInSeconds);

    if (error) throw new Error(`Failed to create signed URL: ${error.message}`);
    return data.signedUrl;
  }

  async delete(storageRef: string): Promise<void> {
    const supabase = getSupabaseServiceClient();
    
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([storageRef]);

    if (error) throw new Error(`Failed to delete file: ${error.message}`);
  }

  async deleteMany(storageRefs: string[]): Promise<void> {
    if (storageRefs.length === 0) return;

    const supabase = getSupabaseServiceClient();
    
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove(storageRefs);

    if (error) throw new Error(`Failed to delete files: ${error.message}`);
  }
}
