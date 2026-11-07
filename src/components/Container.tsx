import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Container({
  as: Component = 'div',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn('mx-auto w-full max-w-[1200px] px-6 md:px-10', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Container;

