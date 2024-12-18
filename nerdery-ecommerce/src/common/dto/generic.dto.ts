export interface GenericResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}
