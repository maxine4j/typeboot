import { boot } from "typeboot";
import { FooService } from "./foo-service"
import { FooRouter } from "./router";

boot([
  { name: 'FooService', dependencies: [], objectConstructor: FooService },
  { name: 'FooRouter', dependencies: ['FooService'], objectConstructor: FooRouter },
]);
