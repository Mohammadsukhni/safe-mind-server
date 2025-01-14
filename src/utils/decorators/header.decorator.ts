import { applyDecorators } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

export const ApiHeaders = () => {
  const decorators = applyDecorators(ApiSecurity('X-API-KEY'));

  return decorators;
};
