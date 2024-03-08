import { boot } from "typeboot";
import { FooService } from "./foo-service";
import { FooRouter } from "./router";
boot({
    components: [
        {
            name: "FooService",
            objectConstructor: FooService,
            dependencies: [],
            roles: [
                "component"
            ]
        },
        {
            name: "FooRouter",
            objectConstructor: FooRouter,
            dependencies: [],
            roles: [
                "component",
                "router"
            ]
        }
    ],
    routes: [
        {
            routerComponentName: "FooRouter",
            routerMethodName: "fooHandler",
            httpMethod: "get",
            path: "/foos"
        }
    ]
});