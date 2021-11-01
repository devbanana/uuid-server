import { Uuid } from '../uuid';
import { PredefinedNamespaces } from './predefined-namespaces';

const namespaces: Record<PredefinedNamespaces, string> = {
  [PredefinedNamespaces.Dns]: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  [PredefinedNamespaces.Url]: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  [PredefinedNamespaces.Oid]: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  [PredefinedNamespaces.X500]: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
};

export class UuidNamespace extends Uuid {
  static isPredefined(namespace: string): namespace is PredefinedNamespaces {
    return namespace in namespaces;
  }

  static fromPredefined(
    predefinedNamespace: PredefinedNamespaces,
  ): UuidNamespace {
    return UuidNamespace.fromRfc4122(namespaces[predefinedNamespace]);
  }
}
