import { api } from './api';
import type { ReportTypeDto } from '@/types/resource.types';

export const reportService = {
  getReportTypes: (): Promise<ReportTypeDto[]> =>
    api.get<ReportTypeDto[]>('/report-types', false),

  create: (payload: { reportTypeId: string; ressourceId: string }): Promise<void> =>
    api.post<void>('/reports', {
      ressource_id: payload.ressourceId,
      report_type_id: payload.reportTypeId,
    }, true),
};
