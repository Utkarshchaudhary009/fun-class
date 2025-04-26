import {  Error as MongooseError } from "mongoose";

export type Error = {
  name?: string;
  message?: string;
  statusCode?: number;
  details?: unknown;
  errors?: { [path: string]: MongooseError.ValidatorError | MongooseError.CastError };
  addError?: (path: string, error: MongooseError.ValidatorError | MongooseError.CastError) => void;
};

export type ErrorResponse = {
  success: boolean;
  message: string;
  error: Error;
};

export type SuccessResponse = {
  success: boolean;
  message: string;
  data: object;
};

export type ApiResponse = ErrorResponse | SuccessResponse;

export type Job = {
  id: string;
  name: string;
  data: object;
  progress: number;
  status: string;
};