import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Badge, Spinner, Alert, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
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

export default function StreamDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [stream, setStream] = useState(location.state?.stream || null);
  const [loading, setLoading] = useState(!stream);
  const [error, setError] = useState(null);

  // Fetch stream details if not provided via location state
  useEffect(() => {
    if (!stream && id) {
      const fetchStream = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await apiService.getStreamById(parseInt(id));
          
          if (response.status === 200) {
            setStream(response.data.stream || response.data);
          } else {
            setError(response.message || 'Failed to fetch stream');
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch stream');
          console.error('Error fetching stream:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchStream();
    }
  }, [id, stream]);

  if (loading) {
    return (
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Streams" breadcrumbItem="Stream Detail" />
          <Row>
            <Col>
              <div className="text-center py-5">
                <Spinner color="primary" />
                <div className="mt-2">Loading stream details...</div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Streams" breadcrumbItem="Stream Detail" />
          <Row>
            <Col>
              <Alert color="danger">
                <i className="mdi mdi-alert-circle-outline me-2"></i>
                {error || 'Stream not found'}
              </Alert>
              <Button color="secondary" onClick={() => navigate('/streams')}>
                <i className="mdi mdi-arrow-left me-1"></i> Back to Streams
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  const fullThumbnailUrl = getFullImageUrl(stream.thumbnail || '');

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Streams" breadcrumbItem={`Stream: ${stream.title}`} />

        <Row>
          <Col lg={8}>
            {/* Thumbnail Section */}
            <Card className="mb-4">
              <CardBody className="p-0">
                {stream.thumbnail ? (
                  <img
                    src={fullThumbnailUrl}
                    alt={stream.title}
                    className="img-fluid rounded-top"
                    style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '400px',
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '0.25rem 0.25rem 0 0'
                    }}
                  >
                    <span className="text-muted">No thumbnail available</span>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Stream Details Section */}
            <Card className="mb-4">
              <CardBody>
                <h3 className="mb-3">{stream.title}</h3>
                
                <div className="mb-3">
                  <h5 className="text-muted">Channel</h5>
                  <p>{stream.channel}</p>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <h5 className="text-muted">Status</h5>
                    <Badge color={stream.isLive ? 'success' : 'secondary'} className="mb-3">
                      {stream.isLive ? '🔴 LIVE' : '⚫ Offline'}
                    </Badge>
                  </div>
                  <div className="col-md-6">
                    <h5 className="text-muted">Duration</h5>
                    <p>
                      {stream.duration === 0 ? (
                        'Not started'
                      ) : (
                        <>
                          {Math.floor(stream.duration / 3600) > 0 && `${Math.floor(stream.duration / 3600)}h `}
                          {Math.floor((stream.duration % 3600) / 60) > 0 && `${Math.floor((stream.duration % 3600) / 60)}m `}
                          {stream.duration % 60}s
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <h5 className="text-muted">Created Date</h5>
                    <p>
                      {new Date(stream.createdAt).toLocaleDateString()}
                      <br />
                      <small className="text-muted">{new Date(stream.createdAt).toLocaleTimeString()}</small>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h5 className="text-muted">Last Updated</h5>
                    <p>
                      {new Date(stream.updatedAt).toLocaleDateString()}
                      <br />
                      <small className="text-muted">{new Date(stream.updatedAt).toLocaleTimeString()}</small>
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Streamer Information */}
            {stream.user && (
              <Card className="mb-4">
                <CardBody>
                  <h5 className="card-title mb-3">Streamer Information</h5>
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Name</h6>
                    <p className="fw-semibold">{stream.user.firstName} {stream.user.lastName}</p>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Username</h6>
                    <p>@{stream.user.userName}</p>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Email</h6>
                    <p>
                      <a href={`mailto:${stream.user.email}`}>{stream.user.email}</a>
                    </p>
                  </div>
                  {stream.user.phone && (
                    <div>
                      <h6 className="text-muted mb-1">Phone</h6>
                      <p>{stream.user.phone}</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Products Section */}
            {stream.products && stream.products.length > 0 && (
              <Card className="mb-4">
                <CardBody>
                  <h5 className="card-title mb-3">
                    Products ({stream.products.length})
                  </h5>
                  {stream.products.map((product) => (
                    <div key={product.id} className="mb-3 pb-3 border-bottom">
                      <h6 className="fw-semibold mb-1">{product.name}</h6>
                      <p className="mb-1">
                        <Badge color="primary">${product.price}</Badge>
                      </p>
                      {product.description && (
                        <p className="text-muted small mb-2">{product.description}</p>
                      )}
                      {product.link && (
                        <a href={product.link} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                          View Product <i className="mdi mdi-external-link ms-1"></i>
                        </a>
                      )}
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>

        <Row>
          <Col>
            <Button color="secondary" onClick={() => navigate('/streams')}>
              <i className="mdi mdi-arrow-left me-1"></i> Back to Streams
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}