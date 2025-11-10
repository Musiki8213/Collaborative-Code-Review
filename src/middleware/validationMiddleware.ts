import { Request, Response, NextFunction } from 'express';


export const requireFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (let field of fields) {
      if (!(field in req.body)) {
        return res.status(400).json({ error: `${field} is required.` });
      }
    }
    next();
  };
};
