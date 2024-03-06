import { TypebootService } from "typeboot";

@TypebootService
export class FooService {

  getFoos(baz: number) {
    return baz;
  }
}

// @TypebootService
// export class BarService {

// }