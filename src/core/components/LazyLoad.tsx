import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadProps {
  children?: React.ReactNode;
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({ 
  children, 
  component: Component,
  props = {}
}) => {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      {Component ? <Component {...props} /> : children}
    </Suspense>
  );
};

export function withLazyLoad<T extends {}>(Component: React.ComponentType<T>) {
  return (props: T) => (
    <LazyLoad>
      <Component {...props} />
    </LazyLoad>
  );
}
