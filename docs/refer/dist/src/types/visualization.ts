export type VisualizationType = 
  | 'mafs-graph'
  | 'recharts'
  | 'svg-animation'
  | 'manim-video'
  | 'interactive';

export interface VisualizationConfig {
  id: string;
  type: VisualizationType;
  title: string;
  description: string;
  component: string;
  props?: Record<string, unknown>;
}

export interface GraphConfig {
  xRange: [number, number];
  yRange: [number, number];
  functions?: {
    fn: string;
    color: string;
    label: string;
  }[];
  points?: {
    x: number;
    y: number;
    label: string;
    color: string;
  }[];
}
