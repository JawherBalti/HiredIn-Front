import { CompanyModel } from './company.model';

export interface JobOfferModel {
  id?: number;
  user_id: number;
  company_id: number;
  title: string;
  description?: string;
  status: 'applied' | 'interview' | 'offer';
  type: string;
  deadline?: string;
  salary?: string;
  location?: string;
  resume_path?: string;
  notes?: string;
  company?: CompanyModel;
  created_at?: string | Date;
}