export interface GenericResponse {
  success: boolean;
  message: string;
}

export interface GenericFailureResponse extends GenericResponse {
  statusCode: string;
  error: string;
}



