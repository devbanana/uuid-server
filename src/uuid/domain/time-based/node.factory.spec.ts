import {
  FakeRandomBytesProvider,
  FakeUuidV1Repository,
} from '../../../../test/utils/test.fakes';
import { NodeFactory } from './node.factory';
import { Node } from './node';
import { UuidV1 } from './uuid-v1';

describe('NodeFactory', () => {
  let randomBytesProvider: FakeRandomBytesProvider;
  let uuidV1Repository: FakeUuidV1Repository;
  let nodeFactory: NodeFactory;

  beforeEach(() => {
    randomBytesProvider = new FakeRandomBytesProvider();
    uuidV1Repository = new FakeUuidV1Repository();
    nodeFactory = new NodeFactory(randomBytesProvider, uuidV1Repository);
  });

  it('can return a given node', async () => {
    const node = await nodeFactory.create('cc:a6:f7:dd:0d:54');
    expect(node).toStrictEqual(Node.fromString('cc:a6:f7:dd:0d:54'));
  });

  it('can generate a random node', async () => {
    const bytes = Buffer.from('bb1e51316d1c', 'hex');
    randomBytesProvider.addRandomValue(bytes);
    const node = await nodeFactory.create();

    expect(node.asBuffer()).toStrictEqual(bytes);
  });

  it('can try multiple times in case of collision', async () => {
    const bytes1 = Buffer.from('e9d8f2d15b6b', 'hex');
    const bytes2 = Buffer.from('6118c377b960', 'hex');

    randomBytesProvider.addRandomValue(bytes1);
    randomBytesProvider.addRandomValue(bytes2);

    await uuidV1Repository.save(
      UuidV1.fromRfc4122(`475573f2-4312-11ec-ae71-${bytes1.toString('hex')}`),
    );

    const node = await nodeFactory.create();
    expect(node.asBuffer()).toStrictEqual(bytes2);
  });

  it('sets the multicast bit', async () => {
    randomBytesProvider.addRandomValue(Buffer.from('78a2413fe45d', 'hex'));
    const node = await nodeFactory.create();
    expect(node.asBuffer()).toStrictEqual(Buffer.from('79a2413fe45d', 'hex'));
  });
});
