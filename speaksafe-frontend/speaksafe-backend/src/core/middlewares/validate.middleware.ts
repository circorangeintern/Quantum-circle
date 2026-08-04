import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";
import { ApiResponse } from "../utils/api-response.util";

export const validate = (schema: ZodType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        ApiResponse.validationError(
          res,
          error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        );
        return;
      }

      next(error);
    }
  };
};
