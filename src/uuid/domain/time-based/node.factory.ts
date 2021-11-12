import { Node } from './node';
import { RandomBytesProvider } from '../random-bytes.provider';
import { UuidV1Repository } from './uuid-v1.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NodeFactory {
  constructor(
    private readonly randomBytesProvider: RandomBytesProvider,
    private readonly uuidV1Repository: UuidV1Repository,
  ) {}

  async create(node?: string): Promise<Node> {
    if (node !== undefined) {
      return Node.fromString(node);
    }

    let generatedNode: Node;

    do {
      const nodeBuffer = await this.randomBytesProvider.generate(6);
      // Set multicast bit
      nodeBuffer[0] |= 0x01;
      generatedNode = Node.fromBuffer(nodeBuffer);
    } while ((await this.uuidV1Repository.countUuidsByNode(generatedNode)) > 0);

    return generatedNode;
  }
}
