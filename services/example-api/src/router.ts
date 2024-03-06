import { TypebootController } from "typeboot";
import { FooService } from "./foo-service";

@TypebootController
export class FooRouter {

  constructor(
    private fooService: FooService,
  ) {}

  async getFoos() {
    return this.fooService == null;
  }
}
