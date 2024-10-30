import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
import { UserController } from './controller/UserController';
import StudentController from './controller/StudentController';
import {RouteDefinition} from './decorator/RouteDefinition';
import * as createError from 'http-errors';
import * as cors from 'cors';
// cors options
const corsOptions ={
    origin: /localhost\:\d{5}$/i, // localhost any 4 digit port
    credentials: true, // needed to set and return cookies
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
    methods: 'GET,PUT,POST,DELETE',
    maxAge: 43200, // 12 hours
};


AppDataSource.initialize().then(async () => {

    // create express app
    const app = express()
    app.use(bodyParser.json())
    app.use(cors(corsOptions))

    // require headers 'X-Requested-With: XmlHttpRequest' and 'Accept:application/json'
    app.use((req: express.Request, res: express.Response, next: express.NextFunction ) => {
        if (req.xhr && req.accepts('application/json')) next();
        else next(createError(406));
    });
    // add handler for pr-flight options request to ANY path
    app.options('*', cors(corsOptions));

    /*// register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next)
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)

            } else if (result !== null && result !== undefined) {
                res.json(result)
            }
        })
    })*/

    // setup express app here
    // ...

        // Iterate over all our controllers and register our routes
    const controllers = [
        StudentController,
        UserController
        // Add other controllers here
    ];
    controllers.forEach((controller) => {
// This is our instantiated class
// eslint-disable-next-line new-cap
        const instance = new controller();
// The prefix saved to our controller
        const path = Reflect.getMetadata('path', controller);
// Our `routes` array containing all our routes for this controller
        const routes: Array<RouteDefinition> = Reflect.getMetadata('routes', controller);
// Iterate over all routes and register them to our express application
        routes.forEach((route) => {
            app[route.method](path+route.param, (req:express.Request, res:express.Response,
                                                 next:express.NextFunction) => {
                const result = instance[route.action]( req, res, next );
                if (result instanceof Promise) {
                    result.then((result) => result !== null && result !== undefined ? res.send(result) :
                        next() )
                        .catch((err) => next(createError(500, err)) );
                } else if (result !== null && result !== undefined) res.json(result);
            });
        });
    });


    // UNBRELLA CODE to catch any paths/http methods with no handlers declared
    // ALSO catches any next() calls in OUR CODE ie controller actions / methods
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        next(createError(404));
    });
    // error handler
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({status: err.status, message: err.message, stack: err.stack.split(/\s{4,}/)});
    });
    const port = process.env.PORT || 3004
    // start express server
    app.listen(port)

    // insert new users for test
    await AppDataSource.manager.save(
        AppDataSource.manager.create(User, {
            firstName: "Timber",
            lastName: "Saw",
            age: 27
        })
    )

    await AppDataSource.manager.save(
        AppDataSource.manager.create(User, {
            firstName: "Phantom",
            lastName: "Assassin",
            age: 24
        })
    )

    console.log(`Express server has started on port ${port}. Open http://localhost:${port}/users to see results`)

}).catch(error => console.log(error))
