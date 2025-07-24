import { useTranslation } from 'react-i18next';
import MonthlyGen from './calendar-gen/monthly-gen';
import React from 'react';

export interface IWork {
  id: string;
  name: string;
  desc: string;
  content: React.ComponentType | string;
}

export const useWorks = (): IWork[] => {
  const { t } = useTranslation();
  
  return [
    {
      id: 'monthly-calendar-gen',
      name: t('作品一'),
      desc: t('作品一简介'),
      content: MonthlyGen,
    }
  ];
}; 