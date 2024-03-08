import { TypebootHttpRouter, TypebootRoute, HttpRequestContext } from "typeboot";
import { FooService } from "./foo-service";

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
