import {
  buildMessage,
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import validator from 'validator';
import isAfter = validator.isAfter;

export default function MaxDateString(
  maxDate: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy({
    name: 'maxDateString',
    constraints: [maxDate],
    validator: {
      validate(
        value: string,
        validationArguments: ValidationArguments,
      ): boolean {
        return !isAfter(value, validationArguments.constraints[0]);
      },
      defaultMessage: buildMessage(eachPrefix => {
        return `${eachPrefix}$property cannot be after $constraint1`;
      }, validationOptions),
    },
  });
}
