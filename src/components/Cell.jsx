import React from 'react';

function Cell({ y, x, color }) {
  return <td id={`${y}-${x}`}><div className="piece" style={{ backgroundColor: color }}></div></td>;
}

export default Cell;