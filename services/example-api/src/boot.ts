import { boot } from "typeboot";
import { FooService } from "./foo-service";
import { FooRouter } from "./router";
boot([
    {
        name: "FooService",
        _constructor: FooService,
        dependencies: []
    },
    {
        name: "FooRouter",
        _constructor: FooRouter,
        dependencies: [
            "FooService"
        ]
    }
]);