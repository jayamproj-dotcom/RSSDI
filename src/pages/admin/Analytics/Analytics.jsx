import React, { useState, useEffect } from 'react';
import { Activity, Users, TrendingUp, Heart, Eye, Brain,  LucideKey as Kidney, Download, RefreshCw, Calendar, Stethoscope, Filter, Settings, Bell, Search, BarChart3, PieChart, LineChart, Globe, Zap, Target, Shield, AlertTriangle } from 'lucide-react';
import './Analytics.css';
import AdminLayout from '../../../layouts/AdminLayout';
import { Link } from 'react-router-dom';

const Analytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState({});
  const [animationKey, setAnimationKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  // Enhanced mock data with real-time simulation
  const patientStats = {
    totalPatients: 2847,
    newPatients: 124,
    activePatients: 2632,
    criticalPatients: 89,
    weeklyGrowth: 4.2,
    monthlyGrowth: 12.7,
    dailyGrowth: 1.8
  };

  const timeframeData = {
    today: { patients: 45, alive: 43, newPatients: 12, recovered: 8, deaths: 2 },
    week: { patients: 312, alive: 298, newPatients: 67, recovered: 45, deaths: 14 },
    month: { patients: 1247, alive: 1189, newPatients: 234, recovered: 156, deaths: 58 }
  };

  const treatmentTypes = [
    { name: 'Oral Hypoglycaemic Agents', count: 1420, percentage: 49.9, color: '#6366F1', trend: '+5.2%' },
    { name: 'Oral + Insulin', count: 982, percentage: 34.5, color: '#10B981', trend: '+2.8%' },
    { name: 'Insulin Only', count: 445, percentage: 15.6, color: '#F59E0B', trend: '-1.4%' }
  ];

  const clinicalMetrics = [
    { name: 'HbA1c', value: 7.2, unit: '%', normalRange: '<7%', trend: 'down', status: 'warning', change: '-0.3' },
    { name: 'Total Cholesterol', value: 198, unit: 'mg/dL', normalRange: '<200', trend: 'stable', status: 'normal', change: '+2' },
    { name: 'Triglycerides', value: 165, unit: 'mg/dL', normalRange: '<150', trend: 'up', status: 'warning', change: '+12' },
    { name: 'HDL', value: 42, unit: 'mg/dL', normalRange: '>40', trend: 'up', status: 'normal', change: '+3' },
    { name: 'LDL', value: 128, unit: 'mg/dL', normalRange: '<100', trend: 'down', status: 'warning', change: '-8' },
    { name: 'VLDL', value: 28, unit: 'mg/dL', normalRange: '<30', trend: 'stable', status: 'normal', change: '0' }
  ];

  const complications = [
    { name: 'Renal', duration: 3.2, severity: 'high', icon: Kidney, patients: 234, trend: '+12%' },
    { name: 'Retinal', duration: 2.8, severity: 'medium', icon: Eye, patients: 189, trend: '+8%' },
    { name: 'Cardiovascular', duration: 4.1, severity: 'high', icon: Heart, patients: 156, trend: '+15%' },
    { name: 'Heart Failure', duration: 2.1, severity: 'medium', icon: Heart, patients: 98, trend: '+5%' },
    { name: 'Cerebrovascular', duration: 1.9, severity: 'low', icon: Brain, patients: 67, trend: '+3%' },
    { name: 'Limb Ischemia', duration: 1.4, severity: 'medium', icon: Activity, patients: 45, trend: '+7%' },
    { name: 'Hypertension', duration: 5.3, severity: 'high', icon: Activity, patients: 312, trend: '+18%' }
  ];

  const demographicData = [
    { ageGroup: '18-30', prevalence: 8.2, tobaccoUse: 23, alcoholUse: 31, tobaccoChewing: 15, patients: 234 },
    { ageGroup: '31-45', prevalence: 15.7, tobaccoUse: 28, alcoholUse: 24, tobaccoChewing: 19, patients: 447 },
    { ageGroup: '46-60', prevalence: 32.4, tobaccoUse: 35, alcoholUse: 18, tobaccoChewing: 22, patients: 923 },
    { ageGroup: '61-75', prevalence: 28.9, tobaccoUse: 31, alcoholUse: 12, tobaccoChewing: 18, patients: 823 },
    { ageGroup: '75+', prevalence: 14.8, tobaccoUse: 22, alcoholUse: 8, tobaccoChewing: 14, patients: 420 }
  ];

  const infectionData = [
    { name: 'UTI', count: 342, severity: 'moderate', treatmentSuccess: 87, trend: '+5%' },
    { name: 'Skin Infections', count: 298, severity: 'mild', treatmentSuccess: 92, trend: '+2%' },
    { name: 'Respiratory', count: 186, severity: 'severe', treatmentSuccess: 79, trend: '+8%' },
    { name: 'Foot Ulcers', count: 154, severity: 'severe', treatmentSuccess: 71, trend: '+12%' },
    { name: 'Oral Infections', count: 132, severity: 'mild', treatmentSuccess: 94, trend: '+1%' }
  ];

  const timeSeriesData = [
    { month: 'Jan', patients: 2650, hba1c: 7.4, infections: 145 },
    { month: 'Feb', patients: 2698, hba1c: 7.3, infections: 132 },
    { month: 'Mar', patients: 2742, hba1c: 7.2, infections: 128 },
    { month: 'Apr', patients: 2789, hba1c: 7.1, infections: 119 },
    { month: 'May', patients: 2821, hba1c: 7.2, infections: 115 },
    { month: 'Jun', patients: 2847, hba1c: 7.2, infections: 112 }
  ];

  // Real-time data simulation
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setRealTimeData(prev => ({
  //       ...prev,
  //       timestamp: new Date().toLocaleTimeString(),
  //       activeUsers: Math.floor(Math.random() * 50) + 150,
  //       systemLoad: Math.floor(Math.random() * 30) + 70
  //     }));
  //     setAnimationKey(prev => prev + 1);
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, []);

  const handleTimeframeChange = (timeframe) => {
    setIsLoading(true);
    setSelectedTimeframe(timeframe);
    setTimeout(() => setIsLoading(false), 5000);
  };

  const handleExport = () => {
    // Simulate export functionality
    const exportData = {
      timeframe: selectedTimeframe,
      patientStats: timeframeData[selectedTimeframe],
      exportTime: new Date().toISOString()
    };
    console.log('Exporting data:', exportData);
    // In real implementation, this would trigger file download
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAnimationKey(prev => prev + 1);
    }, 1000);
  };

  // Interactive Chart Components
  const InteractivePieChart = ({ data, size = 280 }) => {
    const [hoveredSlice, setHoveredSlice] = useState(null);
    const radius = size / 2 - 30;
    const centerX = size / 2;
    const centerY = size / 2;

    let cumulativePercentage = 0;

    return (
      <div className="interactive-chart-container">
        <svg width={size} height={size} className="interactive-pie-chart">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {data.map((item, index) => {
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + item.percentage) * 3.6;
            const largeArcFlag = item.percentage > 50 ? 1 : 0;
            const isHovered = hoveredSlice === index;
            const adjustedRadius = isHovered ? radius + 10 : radius;

            const x1 = centerX + adjustedRadius * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = centerY + adjustedRadius * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = centerX + adjustedRadius * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = centerY + adjustedRadius * Math.sin((endAngle - 90) * Math.PI / 180);

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${adjustedRadius} ${adjustedRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            cumulativePercentage += item.percentage;

            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                className={`interactive-pie-slice ${isHovered ? 'hovered' : ''}`}
                filter={isHovered ? "url(#glow)" : "none"}
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseLeave={() => setHoveredSlice(null)}
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            );
          })}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.4}
            fill="rgba(255, 255, 255, 0.9)"
            className="chart-center"
          />
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            className="chart-center-text"
            fontSize="14"
            fontWeight="600"
            fill="#1e293b"
          >
            Total
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            className="chart-center-value"
            fontSize="18"
            fontWeight="700"
            fill="#3b82f6"
          >
            {data.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </text>
        </svg>
        {hoveredSlice !== null && (
          <div className="chart-tooltip">
            <div className="tooltip-content">
              <div className="tooltip-title">{data[hoveredSlice].name}</div>
              <div className="tooltip-value">{data[hoveredSlice].count} patients ({data[hoveredSlice].percentage}%)</div>
              <div className="tooltip-trend">{data[hoveredSlice].trend}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const InteractiveBarChart = ({ data, height = 250 }) => {
    const [hoveredBar, setHoveredBar] = useState(null);
    const maxValue = Math.max(...data.map(d => d.prevalence));
    const barWidth = 50;
    const spacing = 20;
    const chartWidth = data.length * (barWidth + spacing) + 40;

    return (
      <div className="interactive-bar-container">
        <svg width={chartWidth} height={height} className="interactive-bar-chart">
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          {data.map((item, index) => {
            const barHeight = (item.prevalence / maxValue) * (height - 60);
            const x = index * (barWidth + spacing) + 20;
            const y = height - barHeight - 40;
            const isHovered = hoveredBar === index;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#barGradient)"
                  className={`interactive-bar ${isHovered ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    filter: isHovered ? 'brightness(1.2)' : 'brightness(1)'
                  }}
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 20}
                  textAnchor="middle"
                  className="bar-label"
                  fontSize="12"
                  fontWeight="500"
                  fill="#64748b"
                >
                  {item.ageGroup}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="bar-value"
                  fontSize="11"
                  fontWeight="600"
                  fill="#1e293b"
                >
                  {item.prevalence}%
                </text>
              </g>
            );
          })}
        </svg>
        {hoveredBar !== null && (
          <div className="chart-tooltip">
            <div className="tooltip-content">
              <div className="tooltip-title">Age Group: {data[hoveredBar].ageGroup}</div>
              <div className="tooltip-value">Prevalence: {data[hoveredBar].prevalence}%</div>
              <div className="tooltip-detail">Patients: {data[hoveredBar].patients}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const InteractiveLineChart = ({ data, height = 250 }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const maxPatients = Math.max(...data.map(d => d.patients));
    const minPatients = Math.min(...data.map(d => d.patients));
    const chartWidth = 500;
    const padding = 50;

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * (chartWidth - 2 * padding) + padding;
      const y = height - padding - ((item.patients - minPatients) / (maxPatients - minPatients)) * (height - 2 * padding);
      return { x, y, ...item };
    });

    const pathData = points.map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <div className="interactive-line-container">
        <svg width={chartWidth} height={height} className="interactive-line-chart">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.05)" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
            fill="url(#areaGradient)"
            className="line-area"
          />

          {/* Main line */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            className="interactive-line-path"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))'
            }}
          />

          {/* Data points */}
          {points.map((point, index) => {
            const isHovered = hoveredPoint === index;
            return (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={isHovered ? 8 : 5}
                fill="#6366F1"
                stroke="white"
                strokeWidth="2"
                className="interactive-line-point"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  filter: isHovered ? 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.5))' : 'none'
                }}
              />
            );
          })}
        </svg>
        {hoveredPoint !== null && (
          <div className="chart-tooltip">
            <div className="tooltip-content">
              <div className="tooltip-title">{points[hoveredPoint].month} 2024</div>
              <div className="tooltip-value">Patients: {points[hoveredPoint].patients.toLocaleString()}</div>
              <div className="tooltip-detail">HbA1c: {points[hoveredPoint].hba1c}%</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="futuristic-loading-container">
        <div className="loading-animation">
          <div className="loading-ring"></div>
          <div className="loading-ring"></div>
          <div className="loading-ring"></div>
        </div>
        <div className="loading-text">
          <h3>Analyzing Patient Data</h3>
          <p>Processing real-time analytics...</p>
        </div>
      </div>
    );
  }

  const currentData = timeframeData[selectedTimeframe];

  return (

    <AdminLayout >


    <div className="futuristic-analytics-dashboard" key={animationKey}>
      {/* Advanced Header */}
      <div className="futuristic-header">
        <div className="header-left">
          <div className="medical-logo-advanced">
            <Stethoscope size={28} />
            <div className="logo-pulse"></div>
          </div>
          <div className="header-info-advanced">
            <h1 className="header-title-advanced">Diabetes Care Analytics</h1>
            <p className="header-subtitle-advanced">Dr. Sarah Johnson • Endocrinology Department</p>
            <div className="real-time-indicator">
              <div className="live-dot"></div>
                <span>Live Data • {realTimeData.timestamp || 'Connecting...'}</span>
            </div>
          </div>
        </div>

        <div className="header-right-advanced">
          {/* <div className="header-stats">
            <div className="stat-item">
              <Globe size={16} />
              <span>Active: {realTimeData.activeUsers || 167}</span>
            </div>
            <div className="stat-item">
              <Zap size={16} />
              <span>Load: {realTimeData.systemLoad || 85}%</span>
            </div>
          </div> */}

          <div className="header-actions">
            <button className="action-btn notification-btn">
              <Bell size={16} />
              <span className="notification-badge">3</span>
            </button>
            {/* <button className="action-btn search-btn">
              <Search size={16} />
            </button>
            <button className="action-btn filter-btn">
              <Filter size={16} />
            </button> */}
            <button className="action-btn export-btn-advanced" onClick={handleExport}>
              <Download size={16} />
              <span>Export</span>
            </button>
            {/* <button className="action-btn refresh-btn-advanced" onClick={handleRefresh}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button> */}
            {/* <button className="action-btn settings-btn">
              <Settings size={16} />
            </button> */}
          </div>

          <div className="date-display-advanced">
            <Calendar size={16} />
            <span>4/08/2025</span>
          </div>
        </div>
      </div>

      {/* Advanced Time Period Selector */}
      <div className="advanced-time-selector">
        <div className="selector-container">
          <div className="selector-buttons">
            <button
              className={`selector-btn ${selectedTimeframe === 'today' ? 'active' : ''}`}
              onClick={() => handleTimeframeChange('today')}
            >
              <Target size={16} />
              <span>Today</span>
            </button>
            <button
              className={`selector-btn ${selectedTimeframe === 'week' ? 'active' : ''}`}
              onClick={() => handleTimeframeChange('week')}
            >
              <BarChart3 size={16} />
              <span>Week</span>
            </button>
            <button
              className={`selector-btn ${selectedTimeframe === 'month' ? 'active' : ''}`}
              onClick={() => handleTimeframeChange('month')}
            >
              <LineChart size={16} />
              <span>Month</span>
            </button>
          </div>

          {/* <div className="selector-info">
            <div className="data-freshness">
              <div className="freshness-indicator"></div>
              <span>Data updated 2 min ago</span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Futuristic Stats Grid */}
        <section className="futuristic-stats-grid">
          {/* Total Patients */}
          <div className="futuristic-stat-card blue">
            <div className="stat-info">
              <div>
                <div className="stat-title">Total Patients</div>
                <div className="stat-value">45</div>
                <div className="stat-sub">
                  <span className="stat-change positive">+18.4%</span> vs previous
                </div>
              </div>
              <div className="stat-icon-container">
                <Users size={28} />
              </div>
            </div>
          </div>

          {/* Alive */}
          <div className="futuristic-stat-card green">
            <div className="stat-info">
              <div>
                <div className="stat-title">Alive</div>
                <div className="stat-value">43</div>
                <div className="stat-sub">
                  <span className="stat-change positive">95.6%</span> survival
                </div>
              </div>
              <div className="stat-icon-container">
                <Heart size={28} />
              </div>
            </div>
          </div>

          {/* New Patients */}
          <div className="futuristic-stat-card orange">
            <div className="stat-info">
              <div>
                <div className="stat-title">New Patients</div>
                <div className="stat-value">12</div>
                <div className="stat-sub">
                  <span className="stat-change positive">+50.0%</span> change
                </div>
              </div>
              <div className="stat-icon-container">
                <TrendingUp size={28} />
              </div>
            </div>
          </div>

          {/* Recovered */}
          <div className="futuristic-stat-card teal">
            <div className="stat-info">
              <div>
                <div className="stat-title">Recovered</div>
                <div className="stat-value">8</div>
                <div className="stat-sub">
                  <span className="stat-change positive">17.8%</span> recovery
                </div>
              </div>
              <div className="stat-icon-container">
                <Shield size={28} />
              </div>
            </div>
          </div>

          {/* Deaths */}
          <div className="futuristic-stat-card red">
            <div className="stat-info">
              <div>
                <div className="stat-title">Deaths</div>
                <div className="stat-value">2</div>
                <div className="stat-sub">
                  <span className="stat-change negative">4.4%</span> mortality
                </div>
              </div>
              <div className="stat-icon-container">
                <AlertTriangle size={28} />
              </div>
            </div>
          </div>
        </section>



      {/* Advanced Dashboard Grid */}
      <div className="advanced-dashboard-grid">
        {/* Interactive Treatment Distribution */}
        <div className="advanced-dashboard-card">
          <div className="card-header-advanced">
            <div className="header-left-section">
              <PieChart size={20} />
              <h2>Treatment Distribution</h2>
            </div>
            <div className="header-actions-section">
              <button className="mini-action-btn">
                <Download size={14} />
              </button>
              <button className="mini-action-btn">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
          <div className="card-content-advanced">
            <InteractivePieChart data={treatmentTypes} size={280} />
            <div className="advanced-legend">
              {treatmentTypes.map((type, index) => (
                <div key={index} className="legend-item-advanced">
                  <div className="legend-indicator">
                    <div className="legend-color" style={{ backgroundColor: type.color }}></div>
                    <div className="legend-pulse" style={{ backgroundColor: type.color }}></div>
                  </div>
                  <div className="legend-content">
                    <div className="legend-name">{type.name}</div>
                    <div className="legend-stats">
                      <span className="legend-value">{type.count.toLocaleString()}</span>
                      <span className="legend-percentage">({type.percentage}%)</span>
                      <span className="legend-trend positive">{type.trend}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Clinical Metrics */}
        <div className="advanced-dashboard-card">
          <div className="card-header-advanced">
            <div className="header-left-section">
              <Activity size={20} />
              <h2>Clinical Metrics</h2>
            </div>
            <div className="header-actions-section">
              <button className="mini-action-btn">
                <Filter size={14} />
              </button>
            </div>
          </div>
          <div className="card-content-advanced">
            <div className="advanced-metrics-grid">
              {clinicalMetrics.map((metric, index) => (
                <div key={index} className={`advanced-metric-item ${metric.status}`}>
                  <div className="metric-header-section">
                    <span className="metric-name-advanced">{metric.name}</span>
                    <div className={`trend-indicator-advanced ${metric.trend}`}>
                      {metric.trend === 'up' && <TrendingUp size={12} />}
                      {metric.trend === 'down' && <Activity size={12} />}
                      {metric.trend === 'stable' && <Target size={12} />}
                    </div>
                  </div>
                  <div className="metric-value-section">
                    <div className="metric-value-advanced">
                      {metric.value} <span className="metric-unit-advanced">{metric.unit}</span>
                    </div>
                    <div className={`metric-change ${metric.trend}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}
                    </div>
                  </div>
                  <div className="metric-range-advanced">Normal: {metric.normalRange}</div>
                  <div className="metric-progress">
                    <div className={`progress-bar ${metric.status}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Patient Trends */}
        <div className="advanced-dashboard-card wide">
          <div className="card-header-advanced">
            <div className="header-left-section">
              <LineChart size={20} />
              <h2>Patient Growth Trends</h2>
            </div>
            <div className="header-actions-section">
              <select className="trend-selector">
                <option>Patients</option>
                <option>HbA1c</option>
                <option>Infections</option>
              </select>
            </div>
          </div>
          <div className="card-content-advanced">
            <InteractiveLineChart data={timeSeriesData} height={250} />
          </div>
        </div>

      

        {/* Interactive Demographics */}
        <div className="advanced-dashboard-card">
          <div className="card-header-advanced">
            <div className="header-left-section">
              <BarChart3 size={20} />
              <h2>Age Demographics</h2>
            </div>
          </div>
          <div className="card-content-advanced">
            <InteractiveBarChart data={demographicData} height={250} />
          </div>
        </div>

     

        {/* Advanced Infections Table */}
        <div className="advanced-dashboard-card wide">
          <div className="card-header-advanced">
            <div className="header-left-section">
              <Shield size={20} />
              <h2>Infection Analytics</h2>
            </div>
            <div className="header-actions-section">
              <input type="search" placeholder="Search infections..." className="search-input" />
            </div>
          </div>
          <div className="card-content-advanced">
            <div className="advanced-infections-table">
              <div className="table-header-advanced">
                <span>Infection Type</span>
                <span>Cases</span>
                <span>Severity</span>
                <span>Success Rate</span>
                <span>Trend</span>
              </div>
              {infectionData.map((infection, index) => (
                <div key={index} className="table-row-advanced">
                  <div className="infection-name-advanced">
                    <div className="infection-icon">
                      <Activity size={16} />
                    </div>
                    <span>{infection.name}</span>
                  </div>
                  <span className="infection-count-advanced">{infection.count}</span>
                  <span className={`severity-badge-table ${infection.severity}`}>
                    {infection.severity}
                  </span>
                  <div className="success-rate-advanced">
                    <div className="success-bar-advanced">
                      <div
                        className="success-fill-advanced"
                        style={{ width: `${infection.treatmentSuccess}%` }}
                      ></div>
                    </div>
                    <span className="success-percentage">{infection.treatmentSuccess}%</span>
                  </div>
                  <span className="trend-badge positive">{infection.trend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
        {/* Advanced Lifestyle Factors */}
        <div className="advanced-dashboard-card wide">
          <div className="card-header-advanced">
            <div className="header-left-section">
              <Activity size={20} />
              <h2>Lifestyle Risk Factors</h2>
            </div>
          </div>
          <div className="card-content-advanced">
            <div className="advanced-lifestyle-grid">
              {demographicData.map((group, index) => (
                <div key={index} className="advanced-lifestyle-group">
                  <div className="age-group-header-advanced">
                    <span>{group.ageGroup}</span>
                    <span className="patient-count">{group.patients} patients</span>
                  </div>
                  <div className="lifestyle-factors-advanced">
                    <div className="factor-advanced tobacco">
                      <div className="factor-header">
                        <span className="factor-label-advanced">Tobacco Use</span>
                        <span className="factor-value-advanced">{group.tobaccoUse}%</span>
                      </div>
                      <div className="factor-bar-advanced">
                        <div
                          className="factor-fill-advanced tobacco"
                          style={{ width: `${group.tobaccoUse}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="factor-advanced alcohol">
                      <div className="factor-header">
                        <span className="factor-label-advanced">Alcohol Use</span>
                        <span className="factor-value-advanced">{group.alcoholUse}%</span>
                      </div>
                      <div className="factor-bar-advanced">
                        <div
                          className="factor-fill-advanced alcohol"
                          style={{ width: `${group.alcoholUse}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="factor-advanced chewing">
                      <div className="factor-header">
                        <span className="factor-label-advanced">Tobacco Chewing</span>
                        <span className="factor-value-advanced">{group.tobaccoChewing}%</span>
                      </div>
                      <div className="factor-bar-advanced">
                        <div
                          className="factor-fill-advanced chewing"
                          style={{ width: `${group.tobaccoChewing}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Advanced Complications */}
        <div className="advanced-dashboard-card">
          <div className="card-header-advanced">
            <div className="header-left-section">
              <AlertTriangle size={20} />
              <h2>Complications Analysis</h2>
            </div>
          </div>
          <div className="card-content-advanced">
            <div className="advanced-complications-list">
              {complications.map((comp, index) => {
                const IconComponent = comp.icon;
                return (
                  <div key={index} className={`advanced-complication-item ${comp.severity}`}>
                    <div className="complication-icon-advanced">
                      <IconComponent size={20} />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="complication-content">
                      <div className="complication-header">
                        <span className="complication-name-advanced">{comp.name}</span>
                        <span className={`severity-badge-advanced ${comp.severity}`}>
                          {comp.severity}
                        </span>
                      </div>
                      <div className="complication-stats">
                        <span className="duration-stat">{comp.duration} years avg</span>
                        <span className="patients-stat">{comp.patients} patients</span>
                        <span className={`trend-stat positive`}>{comp.trend}</span>
                      </div>
                    </div>
                    <div className="complication-progress">
                      <div className={`progress-ring ${comp.severity}`}>
                        <div className="progress-value">{Math.round(comp.duration * 10)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

    </div>
      <p className="jayam">
        <a
          href="https://jayamwebsolutions.com/web-design-company-in-chennai.php"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          Developed By Jayam Web Solutions
          <Heart
            size={16}
            color="red"
            fill="red"
            strokeWidth={0}
            style={{ marginLeft: '6px', verticalAlign: 'middle' }}
          />
        </a>
      </p>
    </AdminLayout>
  );
};

export default Analytics;