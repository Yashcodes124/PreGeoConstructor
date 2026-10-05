import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  icon,
}) => {
  return (
    <div className={`bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-lg shadow-black/20 backdrop-blur-sm ${className}`}>
      {(title || action || icon) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-brand-400">{icon}</div>}
            <div>
              {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
