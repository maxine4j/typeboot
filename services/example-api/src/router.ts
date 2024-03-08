import { TypebootHttpRouter, HttpRequestContext } from "typeboot";
import { FooService } from "./foo-service";
import { TypebootRoute } from "typeboot/dist/decorators";

@TypebootHttpRouter
export class FooRouter {

  constructor(
    private fooService: FooService,
  ) {}

  @TypebootRoute('get', '/foos')
  async fooHandler(ctx: HttpRequestContext) {
    ctx.status = 200;
    ctx.body = "hello typeboot, " + this.fooService.doFoo(1);
  }
}
