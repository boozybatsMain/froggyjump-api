import { config } from '../config';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import * as base32 from 'hi-base32';

export class EncryptionService {
  private static readonly algorithm = 'aes-256-ctr';

  static encode(data: string): string {
    const key = Buffer.from(config.telegram.token.substr(0, 32));

    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, key, iv);
    let encoded = cipher.update(data, 'utf8', 'base64');
    encoded += cipher.final('base64');
    const ivBase32 = base32.encode(iv).replace(/=+$/, '');
    const encodedBase32 = base32
      .encode(Buffer.from(encoded, 'base64'))
      .replace(/=+$/, '');
    return `${ivBase32}_${encodedBase32}`;
  }

  static decode(encoded: string): string {
    const key = Buffer.from(config.telegram.token.substr(0, 32));

    const [ivBase32, encryptedBase32] = encoded.split('_');
    const iv = Buffer.from(base32.decode.asBytes(ivBase32));
    const encrypted = Buffer.from(
      base32.decode.asBytes(encryptedBase32),
    ).toString('base64');
    const decipher = createDecipheriv(this.algorithm, key, iv);
    let decoded = decipher.update(encrypted, 'base64', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
  }
}
