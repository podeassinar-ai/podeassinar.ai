import { describe, expect, it } from 'vitest';
import { NodeDocumentExtractor } from './node-document-extractor';

const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const minimalDocxBase64 =
  'UEsDBBQAAAAIAGFjaFx5bjPX6AAAAK0BAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbH1QyU7DMBD9FWuuKHHggBCK0wPLETiUDxjZk8SqN3nc0v49Tlt6QIXjzFv1+tXeO7GjzDYGBbdtB4KCjsaGScHn+rV5AMEFg0EXAyk4EMNq6NeHRCyqNrCCuZT0KCXrmTxyGxOFiowxeyz1zJNMqDc4kbzrunupYygUSlMWDxj6Zxpx64p42df3qUcmxyCeTsQlSwGm5KzGUnG5C+ZXSnNOaKvyyOHZJr6pBJBXExbk74Cz7r0Ok60h8YG5vKGvLPkVs5Em6q2vyvZ/mys94zhaTRf94pZy1MRcF/euvSAebfjpL49zD99QSwMEFAAAAAgAYWNoXJv9N+qtAAAAKQEAAAsAAABfcmVscy8ucmVsc43POw7CMAwG4KtE3mlaBoRQ0y4IqSsqB7ASN61oHkrCo7cnAwNFDIy2f3+W6/ZpZnanECdnBVRFCYysdGqyWsClP232wGJCq3B2lgQsFKFt6jPNmPJKHCcfWTZsFDCm5A+cRzmSwVg4TzZPBhcMplwGzT3KK2ri27Lc8fBpwNpknRIQOlUB6xdP/9huGCZJRydvhmz6ceIrkWUMmpKAhwuKq3e7yCzwpuarF5sXUEsDBBQAAAAIAGFjaFwmbM3LqwAAAAABAAARAAAAd29yZC9kb2N1bWVudC54bWxtjkEKwjAQRa8SsrepLkRK0+7culAPEJOxLSQzIUmtvb2JIIK4ecNnHn+m7Z/OsgeEOBFKvq1qzgA1mQkHya+X4+bAWUwKjbKEIPkKkfdduzSG9OwAE8sFGJtF8jEl3wgR9QhOxYo8YN7dKTiVcgyDWCgYH0hDjLnfWbGr671wakJeKm9k1jJ9QShI3ckq5mY01IoSC8Ob/tc8w5A9xeyEo/pji88B8X2+ewFQSwECFAMUAAAACABhY2hceW4z1+gAAACtAQAAEwAAAAAAAAAAAAAAgAEAAAAAW0NvbnRlbnRfVHlwZXNdLnhtbFBLAQIUAxQAAAAIAGFjaFyb/TfqrQAAACkBAAALAAAAAAAAAAAAAACAARkBAABfcmVscy8ucmVsc1BLAQIUAxQAAAAIAGFjaFwmbM3LqwAAAAABAAARAAAAAAAAAAAAAACAAe8BAAB3b3JkL2RvY3VtZW50LnhtbFBLBQYAAAAAAwADALkAAADJAgAAAAA=';

describe('NodeDocumentExtractor', () => {
  it('extracts text from docx documents without OCR', async () => {
    const extractor = new NodeDocumentExtractor();

    const result = await extractor.extract(Buffer.from(minimalDocxBase64, 'base64'), DOCX_MIME_TYPE);

    expect(result.success).toBe(true);
    expect(result.text).toContain('Ola mundo');
    expect(result.text).toContain('Segunda linha');
    expect(result.metadata.usedOcr).toBe(false);
    expect(result.metadata.mimeType).toBe(DOCX_MIME_TYPE);
  });
});
