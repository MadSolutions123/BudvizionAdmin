import React, { useState, useEffect, useMemo } from "react";
import { Col, Container, Row, Badge, Spinner, Alert, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import ServerPagination from "../../components/Common/ServerPagination";
import DeleteModal from "../../components/Common/DeleteModal";
import { apiService } from "../../helpers/api";

// Helper function to get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const apiBaseUrl = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:3000';
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${apiBaseUrl}${normalizedPath}`;
};

export default function StreamList() {
  const navigate = useNavigate();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Delete modal states
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Define table columns
  const columns = useMemo(
    () => [
      {
        header: 'Stream Title',
        accessorKey: 'title',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const stream = cellProps.row.original;
          return (
            <div>
              <div className="fw-semibold">{stream.title}</div>
              <div className="text-muted small">Channel: {stream.channel}</div>
            </div>
          );
        },
      },
      {
        header: 'Streamer',
        accessorKey: 'user',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const stream = cellProps.row.original;
          const user = stream.user;
          if (!user) return <span className="text-muted">Unknown</span>;
          
          return (
            <div>
              <div className="fw-semibold">{user.firstName} {user.lastName}</div>
              <div className="text-muted small">@{user.userName}</div>
              <div className="text-muted small">{user.email}</div>
            </div>
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'isLive',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const isLive = cellProps.getValue();
          return (
            <Badge color={isLive ? 'success' : 'secondary'}>
              {isLive ? '🔴 LIVE' : '⚫ Offline'}
            </Badge>
          );
        },
      },
      {
        header: 'Duration',
        accessorKey: 'duration',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const duration = cellProps.getValue();
          const hours = Math.floor(duration / 3600);
          const minutes = Math.floor((duration % 3600) / 60);
          const seconds = duration % 60;
          
          if (duration === 0) {
            return <span className="text-muted">Not started</span>;
          }
          
          return (
            <span>
              {hours > 0 && `${hours}h `}
              {minutes > 0 && `${minutes}m `}
              {seconds}s
            </span>
          );
        },
      },
      {
        header: 'Products',
        accessorKey: 'products',
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cellProps) => {
          const products = cellProps.getValue();
          if (!products || products.length === 0) {
            return <span className="text-muted">No products</span>;
          }
          
          return (
            <div>
              <Badge color="info" className="me-2">{products.length} product(s)</Badge>
              <div className="text-muted small mt-1">
                {products.slice(0, 2).map(p => p.name).join(', ')}
                {products.length > 2 && `, +${products.length - 2} more`}
              </div>
            </div>
          );
        },
      },
      {
        header: 'Thumbnail',
        accessorKey: 'thumbnail',
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cellProps) => {
          const thumbnail = cellProps.getValue();
          const fullImageUrl = getFullImageUrl(thumbnail);
          
          if (!thumbnail) {
            return (
              <div 
                className="rounded"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span className="text-muted small">No image</span>
              </div>
            );
          }
          
          return (
            <img 
              src={fullImageUrl}
              alt="Stream Thumbnail" 
              className="rounded"
              style={{ 
                width: '50px', 
                height: '50px', 
                objectFit: 'cover',
                cursor: 'pointer'
              }}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect fill="%23f0f0f0" width="50" height="50"/%3E%3C/svg%3E';
              }}
              title={`Stream: ${cellProps.row.original.title}`}
            />
          );
        },
      },
      {
        header: 'Created Date',
        accessorKey: 'createdAt',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          const createdAt = cellProps.getValue();
          return (
            <span>
              {new Date(createdAt).toLocaleDateString()} <br />
              <small className="text-muted">
                {new Date(createdAt).toLocaleTimeString()}
              </small>
            </span>
          );
        },
      },
      {
        header: 'Actions',
        accessorKey: 'actions',
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cellProps) => {
          const stream = cellProps.row.original;
          return (
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-info"
                onClick={() => handleView(stream)}
                title="View Stream Details"
              >
                <i className="mdi mdi-eye"></i>
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(stream)}
                title="Delete Stream"
              >
                <i className="mdi mdi-delete"></i>
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Fetch streams data
  const fetchStreams = async (page = 1, limit = 10, isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setPaginationLoading(true);
      }
      setError(null);
      
      const response = await apiService.getStreamList(page, limit);
      
      if (response.status === 200) {
        setStreams(response.data.streams);
        setPagination(response.data.pagination);
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to fetch streams');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch streams');
      console.error('❌ Error fetching streams:', err);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams(1, 10, true);
  }, []);

  const handleView = (stream) => {
    navigate(`/streams/${stream.id}/view`, { state: { stream } });
  };

  const handleDelete = (stream) => {
    setSelectedStream(stream);
    setDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStream) return;

    try {
      setDeleteLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await apiService.deleteStream(selectedStream.id);
      
      if (response.status === 200) {
        setSuccessMessage(`Stream "${selectedStream.title}" has been deleted successfully!`);
        await fetchStreams(pagination.page, pagination.limit);
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError(response.message || "Failed to delete stream");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete stream");
    } finally {
      setDeleteModal(false);
      setSelectedStream(null);
      setDeleteLoading(false);
    }
  };

  const handleDeleteModalClose = () => {
    setDeleteModal(false);
    setSelectedStream(null);
  };

  useEffect(() => {
    document.title = "Stream Management | Budvizion Admin";
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Streams" breadcrumbItem="Stream Management" />
          
          {error && (
            <Row>
              <Col>
                <Alert color="danger" className="mb-4">
                  <i className="mdi mdi-alert-circle-outline me-2"></i>
                  {error}
                </Alert>
              </Col>
            </Row>
          )}

          {successMessage && (
            <Row>
              <Col>
                <Alert color="success" className="mb-4">
                  <i className="mdi mdi-check-circle-outline me-2"></i>
                  {successMessage}
                </Alert>
              </Col>
            </Row>
          )}

          <Row>
            <Col>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title mb-0">Stream Management</h4>
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted">
                        Total Streams: <strong>{pagination.total}</strong>
                      </span>
                      {loading && <Spinner size="sm" color="primary" />}
                    </div>
                  </div>

                  {loading && streams.length === 0 ? (
                    <div className="text-center py-5">
                      <Spinner color="primary" />
                      <div className="mt-2">Loading streams...</div>
                    </div>
                  ) : (
                    <>
                      <TableContainer
                        columns={columns}
                        data={streams || []}
                        isGlobalFilter={false}
                        isPagination={false}
                        SearchPlaceholder={`Search ${pagination.total} streams...`}
                        pagination="pagination"
                        paginationWrapper="dataTables_paginate paging_simple_numbers"
                        tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                        theadClass=""
                        divClassName=""
                        isBordered={false}
                        isCustomPageSize={false}
                        buttonClass=""
                        buttonName=""
                        isAddButton={false}
                        handleUserClick={() => {}}
                        isJobListGlobalFilter={false}
                      />
                      
                      <ServerPagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalRecords={pagination.total}
                        pageSize={pagination.limit}
                        onPageChange={(page) => fetchStreams(page, pagination.limit)}
                        onPageSizeChange={(size) => fetchStreams(1, size)}
                        loading={paginationLoading}
                        paginationClass="pagination dataTables_paginate paging_simple_numbers"
                        paginationDiv="col-sm-12 col-md-7"
                      />
                    </>
                  )}

                  {!loading && streams.length === 0 && !error && (
                    <div className="text-center py-5">
                      <i className="mdi mdi-video-off display-4 text-muted"></i>
                      <div className="mt-2">No streams found</div>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleConfirmDelete}
          onCloseClick={handleDeleteModalClose}
          title="Delete Stream"
          message={`Are you sure you want to permanently delete "${selectedStream?.title}"? This action cannot be undone.`}
          deleteButtonText="Yes, Delete Stream"
          loading={deleteLoading}
        />
      </div>
    </React.Fragment>
  );
}