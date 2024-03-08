import { TypebootHttpRouter } from "typeboot";
// import { FooService } from "./foo-service";
import { TypebootRoute } from "typeboot/dist/decorators";

@TypebootHttpRouter
export class FooRouter {

  constructor(
    // private fooService: FooService,
  ) {}

  @TypebootRoute('get', '/foos')
  async fooHandler(ctx: any) {
    ctx.status = 200;
    ctx.body = "hello typeboot, "
  }
}
