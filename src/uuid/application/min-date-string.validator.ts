import {
  buildMessage,
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function minDateString(date: string, minDate: string): boolean {
  return new Date(date) >= new Date(minDate);
}

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
        validationArguments?: ValidationArguments,
      ): boolean {
        return minDateString(value, validationArguments?.constraints[0]);
      },
      defaultMessage: buildMessage(eachPrefix => {
        return `${eachPrefix}$property cannot be before $constraint1`;
      }, validationOptions),
    },
  });
}
