export interface Interview {
  id: number;
  scheduled_time: string;
  location: string;
  status: string;
  job_offer: {
    id: number;
    title: string;
    company: {
      name: string;
      industry: string;
      logo_url: string;
    };
    recruiter: {
      name: string;
      email: string;
    };
  };
}