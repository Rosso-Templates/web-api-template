//-- Variables

import express, { Express } from 'express';

import bodyParser from 'body-parser';

import fs from 'node:fs';

//--

export default class Server {
    port: number;

    private app: Express;
    private routeFilePath: string;

    private routes: string[]
    
    constructor(port: number) {
        this.port = port;
        this.app = express();

        this.routes = [];

        this.routeFilePath = `${__dirname}/routes`
    }

    async init() {
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());

        await this.initRoutes();

        this.app.listen(this.port, () => { console.log(`Listening on port: ${this.port}`) })
    }

    async initRoutes() {
        await this.searchRoutes();
        await this.createRoutes();
    }

    private async createRoutes() {
        for (let i = 0; i < this.routes.length; i++) {
            const route =  this.routes[i].split(this.routeFilePath)[1];

            let routeNames = route.split('/');
            const routeFileName = routeNames[routeNames.length - 1];

            const splitFileName = routeFileName.split('.');
            
            const routeMethod = splitFileName[splitFileName.length - 2];
            const routeName = splitFileName[0];


            routeNames[routeNames.length - 1] = routeName;
            let fullRoute = routeNames.join('/');
            fullRoute = fullRoute.replace('index', '');         

            const routeFile = await import(this.routes[i]);

            if (typeof routeFile.default === 'object') continue;
            
            switch(routeMethod) {
                case 'post':
                    this.app.post(fullRoute, routeFile.default);

                case 'get':
                    this.app.get(fullRoute, routeFile.default);

                case 'put':
                    this.app.put(fullRoute, routeFile.default);

                case 'delete':
                    this.app.delete(fullRoute, routeFile.default);

                case 'patch':
                    this.app.patch(fullRoute, routeFile.default);

                default:
                    this.app.all(fullRoute, routeFile.default);
            }
        }
    }

    private async searchRoutes(path?: string) {
        const pathString = path ? path : this.routeFilePath;
    
        const fsPath = fs.readdirSync(pathString, { withFileTypes: true });

        for (const file of fsPath) {
            if (file.isDirectory()) {
                await this.searchRoutes(file.parentPath + '/' + file.name);
            }

            if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
                this.routes.push(file.parentPath + '/' + file.name);
            }
        }
    }
}

const test = new Server(3000);
test.initRoutes();