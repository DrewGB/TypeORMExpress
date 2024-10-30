import { AppDataSource } from "../data-source"
import {NextFunction, Request, Response} from 'express';
import {Student} from '../entity/Student';
import {Controller} from '../decorator/Controller';
import {Route} from '../decorator/Route';
import {validate, ValidatorOptions} from 'class-validator';

@Controller('/students')
export default class StudentController {
    // get the sweet sweet repo methods (90+) for actions on the student table
    private studentRepo = AppDataSource.getRepository(Student)

    private validOptions : ValidatorOptions = {
        stopAtFirstError: true,
        skipMissingProperties: false,
        validationError: {target: false, value: false},
        whitelist: true,
        forbidNonWhitelisted: true
    }

    // named methods after CRUD - Create, Read, Update, Delete
    @Route('get', "/:id*?") // '*?' makes the param optional
    async read(req: Request, res: Response, next: NextFunction) {
        if (req.params.id)
        {
            return this.studentRepo.findOneBy({id: req.params.id})
        }
        else {
            return this.studentRepo.find() // return all students
        }
    }

    //TODO add the second most simplest action to the controller
    @Route('delete', '/:id') // This time uuid is not optional
    async delete(req: Request, res: Response, next: NextFunction) {
        const user = await this.studentRepo.findOneBy({id: req.params.id})
        if (!user) {
            next()
        } else {
            res.statusCode = 204 // NO CONTENT - Still a success status code but do not send any data back

            await this.studentRepo.remove(user)
            // return
        }
    }

    @Route('post')
    async create(req: Request, res: Response, next: NextFunction) {
        const newStudent = Object.assign(new Student(), req.body) // get the validation rules from entity

        const violations = await validate(newStudent, this.validOptions)
        if (violations.length) {
            res.statusCode = 422 // UNPROCESSABLE CONTENT
            return violations // Return the ugly error message structure - if you are a friendly dev you would clean up messages
        } else {
            res.statusCode = 201 //CREATED status code
            return this.studentRepo.insert(newStudent)
        }
    }

    //TODO make the update action - as a fun exercise have the requirement that the url param must match the body id
    @Route('put', '/:id')
    async update(req: Request, res: Response, next: NextFunction) {
        if (await this.studentRepo.exists(req.params.id))
        {
            const student = await this.studentRepo.findOneBy({id: req.params.id})
            if (student.id === req.params.id)
            {
                const updateStudent = Object.assign(new Student(), req.body)

                const violations = await validate(updateStudent, this.validOptions)
                if (violations.length) {
                    res.statusCode = 422
                    return violations
                } else {
                    await this.studentRepo.save(updateStudent)
                }
            }
        } else {
            next()
        }


    }

}