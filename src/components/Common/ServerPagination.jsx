import { Link } from "react-router-dom";
import React from "react";
import { Row, Col } from "reactstrap";

const ServerPagination = ({ 
  currentPage, 
  totalPages, 
  totalRecords, 
  pageSize, 
  onPageChange, 
  onPageSizeChange,
  isShowingPageLength = true, 
  paginationDiv = "col-sm-12 col-md-7", 
  paginationClass = "pagination justify-content-end",
  loading = false
}) => {

  const handleClick = (pageNumber) => {
    if (pageNumber !== currentPage && !loading) {
      onPageChange(pageNumber);
    }
  };

  const handleprevPage = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handlenextPage = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      pageNumbers.push(1);
      
      if (currentPage > 3) {
        pageNumbers.push('...');
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pageNumbers.includes(i)) {
          pageNumbers.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }
      
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  const startIndex = ((currentPage - 1) * pageSize) + 1;
  const endIndex = Math.min(currentPage * pageSize, totalRecords);

  return (
    <React.Fragment>
      <Row className="justify-content-between align-items-center">
        {isShowingPageLength && (
          <Col sm={12} md={5}>
            <div className="dataTables_info">
              Showing &nbsp; <span className="fw-semibold">{startIndex}</span>&nbsp;to&nbsp; 
              &nbsp;<span className="fw-semibold">{endIndex}</span>&nbsp;of&nbsp; 
              &nbsp;<span className="fw-semibold">{totalRecords}</span>&nbsp;entries
            </div>
          </Col>
        )}
        
        <div className={paginationDiv}>
          <ul className={paginationClass}>
            {/* Previous Button */}
            <li className={`page-item ${currentPage <= 1 || loading ? "disabled" : ''}`}>
              <Link 
                className="page-link" 
                to="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleprevPage();
                }}
              >
                {loading ? (
                  <i className="mdi mdi-loading mdi-spin"></i>
                ) : (
                  <i className="mdi mdi-chevron-left"></i>
                )}
              </Link>
            </li>

            {/* Page Numbers */}
            {pageNumbers.map((item, index) => (
              <li 
                key={index} 
                className={
                  item === '...' 
                    ? "page-item disabled" 
                    : (currentPage === item ? "page-item active" : "page-item")
                }
              >
                {item === '...' ? (
                  <span className="page-link">...</span>
                ) : (
                  <Link 
                    className="page-link" 
                    to="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleClick(item);
                    }}
                  >
                    {loading && currentPage === item ? (
                      <i className="mdi mdi-loading mdi-spin"></i>
                    ) : (
                      item
                    )}
                  </Link>
                )}
              </li>
            ))}

            {/* Next Button */}
            <li className={`page-item ${currentPage >= totalPages || loading ? "disabled" : ''}`}>
              <Link 
                className="page-link" 
                to="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handlenextPage();
                }}
              >
                {loading ? (
                  <i className="mdi mdi-loading mdi-spin"></i>
                ) : (
                  <i className="mdi mdi-chevron-right"></i>
                )}
              </Link>
            </li>
          </ul>
        </div>
      </Row>

      {/* Page Size Selector */}
      {onPageSizeChange && (
        <Row className="mt-2">
          <Col sm={12} md={3}>
            <div className="d-flex align-items-center">
              <span className="me-2">Show:</span>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={pageSize}
                disabled={loading}
                onChange={(e) => {
                  if (!loading) {
                    const newSize = parseInt(e.target.value);
                    onPageSizeChange(newSize);
                  }
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="ms-2">entries</span>
            </div>
          </Col>
        </Row>
      )}
    </React.Fragment>
  );
}

export default ServerPagination; 