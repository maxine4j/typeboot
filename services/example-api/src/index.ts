import { boot } from "typeboot";
import { FooService } from "./foo-service"
import { FooRouter } from "./router";

boot([
  { name: 'FooService', dependencies: [], _constructor: FooService },
  { name: 'FooRouter', dependencies: ['FooService'], _constructor: FooRouter },
]);
