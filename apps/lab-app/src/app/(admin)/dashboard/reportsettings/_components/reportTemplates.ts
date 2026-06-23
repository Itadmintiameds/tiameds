export type TemplateId = 'templateA' | 'templateB' | 'templateC';

export type TemplateConfig = {
  id: TemplateId;
  label: string;
  description: string;
  previewStyle: 'classic' | 'modern' | 'minimal';
  headerStyle: 'full' | 'compact';
  spacing: 'cozy' | 'normal' | 'compact';
  signatureLayout: 'stacked' | 'inline';
};

export const reportTemplates: TemplateConfig[] = [
  {
    id: 'templateA',
    label: 'Template A',
    description: 'Classic report layout',
    previewStyle: 'classic',
    headerStyle: 'full',
    spacing: 'normal',
    signatureLayout: 'inline',
  },
  {
    id: 'templateB',
    label: 'Template B',
    description: 'Modern, airy spacing',
    previewStyle: 'modern',
    headerStyle: 'compact',
    spacing: 'cozy',
    signatureLayout: 'stacked',
  },
  {
    id: 'templateC',
    label: 'Template C',
    description: 'Compact and minimal',
    previewStyle: 'minimal',
    headerStyle: 'compact',
    spacing: 'compact',
    signatureLayout: 'inline',
  },
];
