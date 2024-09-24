//-- Variables

import { Response, Request } from 'express';

//--

export default async function routeEvent(req: Request, res: Response) {
    res.json({ message: 'path' });
}