import { TypebootController, TypebootInject } from "typeboot";
import { FooService } from "./foo-service";

@TypebootController
export class FooRouter {

  constructor(
    @TypebootInject private fooService: FooService,
  ) {}

  async getFoos() {
    return this.fooService.getFoos();
  }
}
