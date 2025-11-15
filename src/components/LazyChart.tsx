import { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Lazy load all recharts components to prevent initialization errors
const LazyLineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);
const LazyBarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);
const LazyPieChart = lazy(() => 
  import('recharts').then(module => ({ default: module.PieChart }))
);
const LazyAreaChart = lazy(() => 
  import('recharts').then(module => ({ default: module.AreaChart }))
);
const LazyLine = lazy(() => 
  import('recharts').then(module => ({ default: module.Line }))
);
const LazyBar = lazy(() => 
  import('recharts').then(module => ({ default: module.Bar }))
);
const LazyPie = lazy(() => 
  import('recharts').then(module => ({ default: module.Pie }))
);
const LazyArea = lazy(() => 
  import('recharts').then(module => ({ default: module.Area }))
);
const LazyXAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);
const LazyYAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);
const LazyCartesianGrid = lazy(() => 
  import('recharts').then(module => ({ default: module.CartesianGrid }))
);
const LazyTooltip = lazy(() => 
  import('recharts').then(module => ({ default: module.Tooltip }))
);
const LazyLegend = lazy(() => 
  import('recharts').then(module => ({ default: module.Legend }))
);
const LazyResponsiveContainer = lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);
const LazyCell = lazy(() => 
  import('recharts').then(module => ({ default: module.Cell }))
);
const LazyBrush = lazy(() => 
  import('recharts').then(module => ({ default: module.Brush }))
);

// Wrapper component for lazy loading
const ChartWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner /></div>}>
    {children}
  </Suspense>
);

// Export wrapped components
export const LineChart: ComponentType<any> = (props) => (
  <ChartWrapper>
    <LazyLineChart {...props} />
  </ChartWrapper>
);

export const BarChart: ComponentType<any> = (props) => (
  <ChartWrapper>
    <LazyBarChart {...props} />
  </ChartWrapper>
);

export const PieChart: ComponentType<any> = (props) => (
  <ChartWrapper>
    <LazyPieChart {...props} />
  </ChartWrapper>
);

export const AreaChart: ComponentType<any> = (props) => (
  <ChartWrapper>
    <LazyAreaChart {...props} />
  </ChartWrapper>
);

export const Line: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyLine {...props} />
  </Suspense>
);

export const Bar: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyBar {...props} />
  </Suspense>
);

export const Pie: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyPie {...props} />
  </Suspense>
);

export const Area: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyArea {...props} />
  </Suspense>
);

export const XAxis: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyXAxis {...props} />
  </Suspense>
);

export const YAxis: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyYAxis {...props} />
  </Suspense>
);

export const CartesianGrid: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyCartesianGrid {...props} />
  </Suspense>
);

export const Tooltip: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyTooltip {...props} />
  </Suspense>
);

export const Legend: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyLegend {...props} />
  </Suspense>
);

export const ResponsiveContainer: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyResponsiveContainer {...props} />
  </Suspense>
);

export const Cell: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyCell {...props} />
  </Suspense>
);

export const Brush: ComponentType<any> = (props) => (
  <Suspense fallback={null}>
    <LazyBrush {...props} />
  </Suspense>
);
