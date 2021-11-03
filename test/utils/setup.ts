import { validate } from 'class-validator';

expect.extend({
  toHaveValidationConstraint: async function (
    received: Record<string, unknown>,
    constraint: string,
    property: string,
  ): Promise<jest.CustomMatcherResult> {
    const options: jest.MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise,
      secondArgument: 'property',
    };

    const matcherHint = this.utils.matcherHint(
      'toHaveValidationConstraint',
      undefined,
      'constraint',
      options,
    );

    const errors = (await validate(received)).filter(
      error => error.property === property,
    );

    let pass = false;
    if (
      errors.length > 0 &&
      errors[0].constraints !== undefined &&
      constraint in errors[0].constraints
    ) {
      pass = true;
    }

    const message = () =>
      matcherHint +
      '\n\n' +
      `Expected: property ${property}${
        this.isNot ? ' not' : ''
      } to have constraint ${constraint}\n` +
      `Received: ${this.utils.printReceived(received)}\n` +
      `Constraints: ${this.utils.stringify(errors[0]?.constraints || {})}`;

    return { pass, message };
  },

  toHaveValidationErrors: async function (
    received: Record<string, unknown>,
  ): Promise<jest.CustomMatcherResult> {
    const options: jest.MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise,
    };

    const matcherHint = this.utils.matcherHint(
      'toHaveValidationErrors',
      undefined,
      'property',
      options,
    );

    const errors = await validate(received);

    const pass = errors.length > 0;
    const message = () =>
      matcherHint +
      '\n\n' +
      `Expected:${this.isNot ? ' not' : ''} to have validation errors\n` +
      `Received: ${this.utils.printReceived(received)}\n` +
      `Error: ${this.utils.stringify(errors[0] || {})}`;

    return { pass, message };
  },

  toHaveValidationErrorsOn: async function (
    received: Record<string, unknown>,
    property: string,
  ): Promise<jest.CustomMatcherResult> {
    const options: jest.MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise,
    };

    const matcherHint = this.utils.matcherHint(
      'toHaveValidationErrorsOn',
      undefined,
      'property',
      options,
    );

    const errors = (await validate(received)).filter(
      error => error.property === property,
    );

    const pass = errors.length > 0;
    const message = () =>
      matcherHint +
      '\n\n' +
      `Expected:${
        this.isNot ? ' not' : ''
      } to have validation errors on property ${property}\n` +
      `Received: ${this.utils.printReceived(received)}\n` +
      `Constraints: ${this.utils.stringify(errors[0]?.constraints || {})}`;

    return { pass, message };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toHaveValidationConstraint(
        constraint: string,
        property: string,
      ): Promise<jest.CustomMatcherResult>;

      toHaveValidationErrors(): Promise<jest.CustomMatcherResult>;

      toHaveValidationErrorsOn(
        property: string,
      ): Promise<jest.CustomMatcherResult>;
    }
  }
}
