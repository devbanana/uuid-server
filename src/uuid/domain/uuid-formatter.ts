import { Injectable } from '@nestjs/common';
import { Uuid } from './uuid';
import { UuidFormats } from './uuid-formats';

@Injectable()
export class UuidFormatter {
  format(uuid: Uuid, format: UuidFormats | undefined): string {
    switch (format) {
      case UuidFormats.Base32:
        return uuid.asBase32();

      case UuidFormats.Base58:
        return uuid.asBase58();

      case UuidFormats.Base64:
        return uuid.asBase64();

      case UuidFormats.Number:
        return uuid.asNumber().toString();

      case UuidFormats.Binary:
        return uuid.asBinary();

      default:
        return uuid.asRfc4122();
    }
  }
}
