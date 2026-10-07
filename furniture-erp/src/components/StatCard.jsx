import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, change, positive, isIncrease, icon, iconBg, iconColor }) => {
  const isUp = positive !== undefined ? positive : isIncrease;

  // Default color palette fallback
  const defaultBg = iconBg || (positive ? '#eff6ff' : '#fef3c7');
  const defaultColor = iconColor || (positive ? '#2563eb' : '#d97706');

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon;
    return <IconComponent size={13} />;
  };

  return (
    <div className="stat-card">
      <div className="stat-header-row">
        <span className="stat-label">{title}</span>
        {icon && (
          <div className="stat-icon-wrapper" style={{ backgroundColor: defaultBg, color: defaultColor }}>
            {renderIcon()}
          </div>
        )}
      </div>

      <div className="stat-body">
        <div className="stat-value">{value}</div>
        {change && (
          <div className={`stat-change ${isUp ? 'up' : 'down'}`}>
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
