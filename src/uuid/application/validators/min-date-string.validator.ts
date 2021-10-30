import {
  buildMessage,
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import validator from 'validator';
import isBefore = validator.isBefore;

export default function MinDateString(
  minDate: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy({
    name: 'minDateString',
    constraints: [minDate],
    validator: {
      validate(
        value: string,
        validationArguments: ValidationArguments,
      ): boolean {
        return !isBefore(value, validationArguments.constraints[0]);
      },
      defaultMessage: buildMessage(eachPrefix => {
        return `${eachPrefix}$property cannot be before $constraint1`;
      }, validationOptions),
    },
  });
}
