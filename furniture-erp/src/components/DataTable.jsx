import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ columns, data, searchPlaceholder = "Search records...", actions, title, extraHeaderControls, pageSize = 4 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((row) => {
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      <div
        style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {title && <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h3>}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-end', minWidth: '220px' }}>
          <div className="search-bar" style={{ minWidth: '220px', maxWidth: '380px', width: '100%', flex: '1 1 auto' }}>
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {extraHeaderControls}
        </div>
      </div>

      <div className="data-table-scroll-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  style={{ 
                    padding: '0.55rem 0.75rem', 
                    fontWeight: '700', 
                    textTransform: 'uppercase', 
                    fontSize: '0.72rem', 
                    letterSpacing: '0.03em',
                    whiteSpace: 'nowrap',
                    width: col.width || 'auto',
                    minWidth: col.minWidth || 'auto',
                    textAlign: col.align || 'left'
                  }}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th 
                  style={{ 
                    padding: '0.55rem 0.75rem', 
                    textAlign: 'right', 
                    fontWeight: '700', 
                    textTransform: 'uppercase', 
                    fontSize: '0.72rem', 
                    letterSpacing: '0.03em',
                    whiteSpace: 'nowrap',
                    minWidth: '160px'
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr 
                  key={`${row.id || row._id || 'row'}-${rowIdx}`} 
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.15s ease' }}
                  className="hover-row"
                >
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      style={{ 
                        padding: '0.55rem 0.75rem', 
                        color: 'var(--slate-800)', 
                        verticalAlign: 'middle',
                        textAlign: col.align || 'left',
                        whiteSpace: col.noWrap ? 'nowrap' : 'normal'
                      }}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap', minWidth: '160px' }}>
                      <div style={{ display: 'inline-flex', justifyContent: 'flex-end', gap: '0.35rem', alignItems: 'center' }}>
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--slate-400)' }}>
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ padding: '0.65rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.8125rem', padding: '0 0.5rem', fontWeight: '600', color: '#334155' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
