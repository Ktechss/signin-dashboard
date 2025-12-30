// NodeConnector - SVG bezier curve connector with animated dot
// Reusable component for connecting workflow nodes

import React from 'react';

/**
 * SVG Connector with bezier curve and optional animated dot
 * @param {number} startX - Starting X coordinate
 * @param {number} startY - Starting Y coordinate
 * @param {number} endX - Ending X coordinate
 * @param {number} endY - Ending Y coordinate
 * @param {boolean} animated - Whether to show animated dot (default: true)
 * @param {string} strokeColor - Line color (default: '#cbd5e1')
 * @param {string} dotColor - Dot color (default: '#64748b')
 * @param {number} strokeWidth - Line width (default: 2)
 */
export function NodeConnector({
  startX,
  startY,
  endX,
  endY,
  animated = true,
  strokeColor = '#cbd5e1',
  dotColor = '#64748b',
  strokeWidth = 2,
}) {
  const controlOffset = Math.min(Math.abs(endX - startX) * 0.5, 80);

  const path = `
    M ${startX} ${startY}
    C ${startX + controlOffset} ${startY},
      ${endX - controlOffset} ${endY},
      ${endX} ${endY}
  `;

  return (
    <g>
      {/* Main connection line */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Animated dot traveling along the path */}
      {animated && (
        <circle r="4" fill={dotColor}>
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      )}
    </g>
  );
}

export default NodeConnector;
