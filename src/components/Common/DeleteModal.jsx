import PropTypes from 'prop-types'
import React from "react"
import { Modal, ModalBody } from "reactstrap"

const DeleteModal = ({ show, onDeleteClick, onCloseClick, title = "Delete Item", message = "Are you sure you want to permanently delete this item?", deleteButtonText = "Delete Now", loading = false }) => {
  return (
    <Modal size="md" isOpen={show} toggle={onCloseClick} centered={true}>
      <div className="modal-content">
        <ModalBody className="px-4 py-5 text-center">
          <button type="button" onClick={onCloseClick} className="btn-close position-absolute end-0 top-0 m-3"></button>
          <div className="avatar-sm mb-4 mx-auto">
            <div className="avatar-title bg-danger text-danger bg-opacity-10 font-size-20 rounded-3">
              <i className="mdi mdi-trash-can-outline"></i>
            </div>
          </div>
          <h5 className="mb-3">{title}</h5>
          <p className="text-muted font-size-16 mb-4">{message}</p>

          <div className="hstack gap-2 justify-content-center mb-0">
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={onDeleteClick}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="mdi mdi-loading mdi-spin me-2"></i>
                  Deleting...
                </>
              ) : (
                deleteButtonText
              )}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCloseClick}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  )
}

DeleteModal.propTypes = {
  onCloseClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  show: PropTypes.any,
  title: PropTypes.string,
  message: PropTypes.string,
  deleteButtonText: PropTypes.string,
  loading: PropTypes.bool
}

export default DeleteModal
