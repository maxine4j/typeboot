import { TypebootComponent } from "typeboot";

@TypebootComponent
export class FooService {

  doFoo(baz: number) {
    return baz;
  }
}
