import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  Label,
  Input,
  Button,
  FormFeedback,
  Alert,
  Spinner,
} from "reactstrap";
import Switch from "react-switch";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import { apiService } from "../../helpers/api";

// User interface
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phone: string;
  role: string;
  dob?: string;
  superLinkEnabled?: boolean;
  superLinkUrl?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  status: number;
  data: User;
}

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id); // Determine mode based on ID presence
  
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isValidHttpUrl = (value: string): boolean => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Function to calculate age
  const calculateAge = (dobString: string): number => {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Form validation schema - all fields required
  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .required("First name is required"),
    lastName: Yup.string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .required("Last name is required"),
    email: Yup.string()
      .email("Please enter a valid email")
      .required("Email is required"),
    userName: Yup.string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .required("Username is required"),
    phone: Yup.string()
      .matches(/^[+]?[\d\s-()]+$/, "Please enter a valid phone number")
      .required("Phone number is required"),
    role: Yup.string()
      .oneOf(["viewer", "streamer", "superAdmin"], "Please select a valid role")
      .required("Role is required"),
    dob: Yup.string()
      .required("Date of birth is required")
      .test("age-check", "User must be at least 21 years old", function(value) {
        if (!value) return false;
        return calculateAge(value) >= 21;
      }),
    superLinkEnabled: Yup.boolean().required(),
    superLinkUrl: Yup.string().test(
      "super-link-url",
      "Please enter a valid URL (must start with http:// or https://)",
      function (value) {
        const enabled = (this.parent as any)?.superLinkEnabled;
        if (!enabled) return true;
        if (!value) return true;
        return isValidHttpUrl(value);
      }
    ),
    // Password fields only required for create mode
    ...(isEditMode ? {} : {
      password: Yup.string()
        .min(7)
        .required(),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm password is required"),
    }),
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      userName: "",
      phone: "",
      role: "viewer",
      dob: "",
      superLinkEnabled: false,
      superLinkUrl: "",
      // Password fields only for create mode
      ...(isEditMode ? {} : {
        password: "",
        confirmPassword: "",
      }),
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setSubmitLoading(true);
        setError(null);
        setSuccessMessage(null);

        console.log(`🔄 ${isEditMode ? 'Updating' : 'Creating'} user with values:`, values);

        // Filter out confirmPassword before API call (only needed for UI validation)
        const { confirmPassword, ...apiData } = values;

        const response = isEditMode 
          ? await apiService.updateUser(id!, apiData)
          : await apiService.createUser(apiData);
        
        if (response.status === 200 || response.status === 201) {
          const successMsg = isEditMode 
            ? "User information has been updated successfully!"
            : "User has been created successfully!";
          
          setSuccessMessage(successMsg);
          setError(null); // Clear any previous errors
          console.log(`✅ User ${isEditMode ? 'updated' : 'created'} successfully:`, response);
          
          // Clear the success message after 5 seconds
          setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);

          // Reset form for create mode
          if (!isEditMode) {
            formik.resetForm();
          }
        } else {
          setError(response.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
        console.error(`❌ Error ${isEditMode ? 'updating' : 'creating'} user:`, err);
      } finally {
        setSubmitLoading(false);
      }
    },
  });

  // Fetch user data on component mount (only in edit mode)
  useEffect(() => {
    const fetchUser = async () => {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`🔄 Fetching user with ID: ${id}`);

        const response: ApiResponse = await apiService.getUserById(id!);
        console.log("🔄 Response:", response);
        
        if (response.status === 200) {
          const user: User = response.data;
          
          // Set form values
          formik.setValues({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userName: user.userName,
            phone: user.phone,
            role: user.role,
            dob: user.dob || "",
            superLinkEnabled: Boolean(user.superLinkEnabled),
            superLinkUrl: user.superLinkUrl || "",
          });

          console.log("✅ User data loaded:", user);
        } else {
          setError(response.message || "Failed to fetch user");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch user");
        console.error("❌ Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, isEditMode]);

  // Meta title
  useEffect(() => {
    document.title = `${isEditMode ? 'Edit' : 'Create'} User | Skote - Vite React Admin & Dashboard Template`;
  }, [isEditMode]);

  if (loading) {
    return (
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Users" breadcrumbItem={`${isEditMode ? 'Edit' : 'Create'} User`} />
          <div className="text-center py-5">
            <Spinner color="primary" size="lg" />
            <div className="mt-2">Loading user data...</div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Users" breadcrumbItem={`${isEditMode ? 'Edit' : 'Create'} User`} />

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
          <Col lg={8} className="mx-auto">
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title mb-0">{isEditMode ? 'Edit User' : 'Create New User'}</h4>
                  <Button
                    color="secondary"
                    outline
                    onClick={() => navigate("/users")}
                  >
                    <i className="mdi mdi-arrow-left me-1"></i>
                    Back to Users
                  </Button>
                </div>

                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    formik.handleSubmit();
                    return false;
                  }}
                >
                  <Row>
                    {/* First Name */}
                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="firstName">First Name <span className="text-danger">*</span></Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="Enter first name"
                          value={formik.values.firstName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={formik.touched.firstName && formik.errors.firstName ? true : false}
                        />
                        {formik.touched.firstName && formik.errors.firstName ? (
                          <FormFeedback type="invalid">{formik.errors.firstName}</FormFeedback>
                        ) : null}
                      </div>
                    </Col>

                    {/* Last Name */}
                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="lastName">Last Name <span className="text-danger">*</span></Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Enter last name"
                          value={formik.values.lastName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={formik.touched.lastName && formik.errors.lastName ? true : false}
                        />
                        {formik.touched.lastName && formik.errors.lastName ? (
                          <FormFeedback type="invalid">{formik.errors.lastName}</FormFeedback>
                        ) : null}
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    {/* Email */}
                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="email">Email <span className="text-danger">*</span></Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter email address"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={formik.touched.email && formik.errors.email ? true : false}
                        />
                        {formik.touched.email && formik.errors.email ? (
                          <FormFeedback type="invalid">{formik.errors.email}</FormFeedback>
                        ) : null}
                      </div>
                    </Col>

                    {/* Username */}
                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="userName">Username <span className="text-danger">*</span></Label>
                        <Input
                          id="userName"
                          name="userName"
                          type="text"
                          placeholder="Enter username"
                          value={formik.values.userName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={formik.touched.userName && formik.errors.userName ? true : false}
                        />
                        {formik.touched.userName && formik.errors.userName ? (
                          <FormFeedback type="invalid">{formik.errors.userName}</FormFeedback>
                        ) : null}
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    {/* Phone */}
                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="phone">Phone Number <span className="text-danger">*</span></Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="text"
                          placeholder="Enter phone number"
                          value={formik.values.phone}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={formik.touched.phone && formik.errors.phone ? true : false}
                        />
                        {formik.touched.phone && formik.errors.phone ? (
                          <FormFeedback type="invalid">{formik.errors.phone}</FormFeedback>
                        ) : null}
                      </div>
                    </Col>

                    {/* Role */}
                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="role">Role <span className="text-danger">*</span></Label>
                        <Input
                          id="role"
                          name="role"
                          type="select"
                          value={formik.values.role}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={formik.touched.role && formik.errors.role ? true : false}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="streamer">Streamer</option>
                          <option value="superAdmin">Super Admin</option>
                        </Input>
                        {formik.touched.role && formik.errors.role ? (
                          <FormFeedback type="invalid">{formik.errors.role}</FormFeedback>
                        ) : null}
                      </div>
                    </Col>
                  </Row>

                  <Row className="align-items-end">
                    <Col md={4}>
                      <div className="mb-3">
                        <Label htmlFor="superLinkEnabled">Super Link</Label>
                        <div className="d-flex align-items-center gap-2">
                          <Switch
                            id="superLinkEnabled"
                            checked={Boolean(formik.values.superLinkEnabled)}
                            onChange={(checked) => {
                              formik.setFieldValue("superLinkEnabled", checked);
                              formik.setFieldTouched("superLinkEnabled", true);
                            }}
                            height={18}
                            width={36}
                            uncheckedIcon={false}
                            checkedIcon={false}
                          />
                          <div>{formik.values.superLinkEnabled ? "ON" : "OFF"}</div>
                        </div>
                      </div>
                    </Col>

                    <Col md={8}>
                      <div className="mb-3">
                        <Label htmlFor="superLinkUrl">Super Link URL</Label>
                        <Input
                          id="superLinkUrl"
                          name="superLinkUrl"
                          type="text"
                          placeholder="https://example.com"
                          value={formik.values.superLinkUrl}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled={!formik.values.superLinkEnabled}
                          invalid={formik.touched.superLinkUrl && formik.errors.superLinkUrl ? true : false}
                        />
                        {formik.touched.superLinkUrl && formik.errors.superLinkUrl ? (
                          <FormFeedback type="invalid">{formik.errors.superLinkUrl as any}</FormFeedback>
                        ) : null}
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    {/* Date of Birth */}
                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="dob">Date of Birth <span className="text-danger">*</span></Label>
                        <Input
                          id="dob"
                          name="dob"
                          type="date"
                          placeholder="Select date of birth"
                          value={formik.values.dob}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={formik.touched.dob && formik.errors.dob ? true : false}
                        />
                        {formik.touched.dob && formik.errors.dob ? (
                          <FormFeedback type="invalid">{formik.errors.dob}</FormFeedback>
                        ) : null}
                        <small className="form-text text-muted">
                          Must be at least 21 years old.
                        </small>
                      </div>
                    </Col>
                  </Row>

                  {/* Password Fields - Only for Create Mode */}
                  {!isEditMode && (
                    <Row>
                      {/* Password */}
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="password">Password <span className="text-danger">*</span></Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter password"
                            value={formik.values.password || ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.password && formik.errors.password ? true : false}
                          />
                          {formik.touched.password && formik.errors.password ? (
                            <FormFeedback type="invalid">{formik.errors.password}</FormFeedback>
                          ) : null}
                          <small className="form-text text-muted">
                            Password must be at least 7 characters long.
                          </small>
                        </div>
                      </Col>

                      {/* Confirm Password */}
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="confirmPassword">Confirm Password <span className="text-danger">*</span></Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm password"
                            value={formik.values.confirmPassword || ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.confirmPassword && formik.errors.confirmPassword ? true : false}
                          />
                          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                            <FormFeedback type="invalid">{formik.errors.confirmPassword}</FormFeedback>
                          ) : null}
                        </div>
                      </Col>
                    </Row>
                  )}

                  {/* Submit Buttons */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button
                      type="button"
                      color="secondary"
                      onClick={() => navigate("/users")}
                      disabled={submitLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          {isEditMode ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <i className={`mdi ${isEditMode ? 'mdi-content-save' : 'mdi-account-plus'} me-1`}></i>
                          {isEditMode ? 'Update User' : 'Create User'}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserForm; 