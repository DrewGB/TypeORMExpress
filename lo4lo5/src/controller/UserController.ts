import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { User } from "../entity/User"
import {validate, ValidatorOptions} from "class-validator";
import {Controller} from '../decorator/Controller';
import {Route} from '../decorator/Route';

@Controller('/users') // the base path is http://localhost:3004/users
export class UserController {

    private userRepository = AppDataSource.getRepository(User)

    @Route('get')
    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find()
    }

    @Route('get', "/:id")
    async one(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id)


        const user = await this.userRepository.findOne({
            where: { id }
        })

        if (!user) {
            // return "unregistered user"
            next()
        }
        return user
    }

    private validOptions: ValidatorOptions = {
        stopAtFirstError: true, // only process the first error - this is why the order of validatorsis important
        skipMissingProperties: false, // if fields are missing still validate
        validationError: {target: false, value: false}, // hide the target which shoes the entirestudent object with values
    };

    @Route('post')
    async save(request: Request, response: Response, next: NextFunction) {
        const user = Object.assign(new User(), request.body)

        const violations = await validate(user, this.validOptions)
        if (violations.length) {
            response.statusCode = 422; // Uncrossable Entity
            return violations;
        } else {
            response.statusCode = 201; // Created
            return this.userRepository.save(user);
        }
    }

    @Route('delete', '/:id')
    async remove(request: Request, response: Response, next: NextFunction) {
        const userToRemove = await this.userRepository.findOneBy({id: request.params.id});
        response.statusCode = 204; // No Content
        if (userToRemove) return this.userRepository.remove(userToRemove);
        else next(); // let index.ts catch the 404 error and reply with JSON
    }

}