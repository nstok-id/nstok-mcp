export interface UIComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

export interface UIComponent {
  id: string;
  name: string;
  repository: string; // e.g. 'Nstok-ui'
  category: 'layout' | 'data-display' | 'form' | 'feedback' | 'navigation' | 'overlay';
  description: string;
  props: UIComponentProp[];
  dependencies: string[];
  usedBy: string[]; // List of features or apps using this component
  sourcePath: string;
  exportName: string;
}
