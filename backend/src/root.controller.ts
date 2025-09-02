import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  hello() {
    return 'Hello World!';
  }
}
