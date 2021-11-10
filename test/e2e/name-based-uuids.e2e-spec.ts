import {
  closeApp,
  createRequest,
  generateUuids,
  initiateApp,
  isErrorResponse,
  NO_ERROR_RESPONSE_MESSAGE,
} from '../utils/test.helpers';
import { UuidFormatMap } from '../utils/test.types';
import { UuidV3 } from '../../src/uuid/domain/name-based/uuid-v3';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UuidNamespace } from '../../src/uuid/domain/name-based/uuid-namespace';
import { UuidName } from '../../src/uuid/domain/name-based/uuid-name';
import { PredefinedNamespaces } from '../../src/uuid/domain/name-based/predefined-namespaces';
import { UuidFormats } from '../../src/uuid/domain/uuid-formats';
import { UuidV5 } from '../../src/uuid/domain/name-based/uuid-v5';
import { Md5HashProvider } from '../../src/uuid/domain/name-based/md5-hash.provider';
import { Sha1HashProvider } from '../../src/uuid/domain/name-based/sha1-hash.provider';
import { HashProvider } from '../../src/uuid/domain/name-based/hash.provider';
import { FakeMd5HashProvider, FakeSha1HashProvider } from '../utils/test.fakes';
import { Buffer } from 'buffer';

type HashSpy = jest.SpyInstance<
  ReturnType<HashProvider['hash']>,
  jest.ArgsType<HashProvider['hash']>
>;

const uuids: Record<3 | 5, UuidFormatMap> = {
  3: generateUuids(UuidV3.fromRfc4122('d4970169-f9a4-31c9-a11b-08609bb119c2')),
  5: generateUuids(UuidV5.fromRfc4122('0cabaa1d-1c4d-5cf5-8938-b56ac03409f4')),
};

describe('Name-based UUIDs', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let spies: Record<3 | 5, HashSpy>;

  beforeEach(async () => {
    app = await initiateApp([
      { provider: Md5HashProvider, override: FakeMd5HashProvider },
      { provider: Sha1HashProvider, override: FakeSha1HashProvider },
    ]);
    request = createRequest(app);

    const md5Provider = app.get<Md5HashProvider, FakeMd5HashProvider>(
      Md5HashProvider,
    );
    const sha1Provider = app.get<Sha1HashProvider, FakeSha1HashProvider>(
      Sha1HashProvider,
    );

    md5Provider.data = Buffer.from('d4970169f9a4c1c9611b08609bb119c2', 'hex');
    // noinspection SpellCheckingInspection
    sha1Provider.data = Buffer.from(
      '0cabaa1d1c4dacf54938b56ac03409f429b1076e',
      'hex',
    );

    spies = {
      '3': jest.spyOn(md5Provider, 'hash'),
      '5': jest.spyOn(sha1Provider, 'hash'),
    };
  });

  describe.each`
    version
    ${3}
    ${5}
  `('version $version', ({ version }: { version: 3 | 5 }) => {
    let spy: HashSpy;

    beforeEach(() => {
      spy = spies[version];
    });

    it(`generates a V${version} UUID`, async () => {
      const namespace = `e9cd4085-931c-4581-a174-eeb825a1de8d`;
      const name = `foo`;
      await request
        .get(`/uuid/v${version}/generate?namespace=${namespace}&name=${name}`)
        .expect(200);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        Buffer.concat([
          UuidNamespace.fromRfc4122(namespace).asBuffer(),
          UuidName.fromString(name).asBuffer(),
        ]),
      );
    });

    it.each`
      namespace                    | name
      ${PredefinedNamespaces.Dns}  | ${'devbanana.me'}
      ${PredefinedNamespaces.Url}  | ${'https://www.devbanana.me'}
      ${PredefinedNamespaces.Oid}  | ${'1.3.6.1'}
      ${PredefinedNamespaces.X500} | ${'CN=Bob,C=US'}
    `(
      'can generate a UUID with the $namespace namespace',
      async ({
        namespace,
        name,
      }: {
        namespace: PredefinedNamespaces;
        name: string;
      }) => {
        await request
          .get(`/uuid/v${version}/generate?namespace=${namespace}&name=${name}`)
          .expect(200);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(
          Buffer.concat([
            UuidNamespace.fromPredefined(namespace).asBuffer(),
            UuidName.fromString(name).asBuffer(),
          ]),
        );
      },
    );

    it('rejects an invalid predefined namespace', async () => {
      const response = await request
        .get(`/uuid/v${version}/generate?namespace=ns:foo&name=bar`)
        .expect(400);

      if (!isErrorResponse(response.body)) {
        fail(NO_ERROR_RESPONSE_MESSAGE);
      }

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message[0]).toContain(
        'Namespace must either be an RFC4122-formatted UUID, or a predefined namespace',
      );
    });

    it('rejects a non-RFC4122 namespace', async () => {
      const response = await request
        .get(`/uuid/v${version}/generate?namespace=8TeQn4u7anLk&name=foo`)
        .expect(400);

      if (!isErrorResponse(response.body)) {
        fail(NO_ERROR_RESPONSE_MESSAGE);
      }

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message[0]).toContain(
        'Namespace must either be an RFC4122-formatted UUID,' +
          ' or a predefined namespace',
      );
    });

    it('requires a name to be provided', async () => {
      const response = await request
        .get(`/uuid/v${version}/generate?namespace=ns:dns`)
        .expect(400);

      if (!isErrorResponse(response.body)) {
        fail(NO_ERROR_RESPONSE_MESSAGE);
      }

      expect(response.body.message[0]).toContain(
        'Name must be provided and not empty',
      );
    });

    it('requires a name to have at least 1 character', async () => {
      const response = await request
        .get(`/uuid/v${version}/generate?namespace=ns:dns&name=`)
        .expect(400);

      if (!isErrorResponse(response.body)) {
        fail(NO_ERROR_RESPONSE_MESSAGE);
      }

      expect(response.body.message[0]).toContain(
        'Name must be provided and not empty',
      );
    });

    it.each`
      format
      ${'base32'}
      ${'base58'}
      ${'base64'}
      ${'binary'}
      ${'number'}
    `(
      'can format the UUID as $format',
      async ({ format }: { format: UuidFormats }) => {
        await request
          .get(
            `/uuid/v${version}/generate?namespace=ns:dns&name=devbanana.me&format=${format}`,
          )
          .expect(200)
          .expect({ uuid: uuids[version][format] });
      },
    );
  });

  afterEach(async () => {
    await closeApp(app);
  });
});
