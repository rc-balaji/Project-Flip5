import React, { useState } from "react";
import { Modal, Button, Container, Row, Col } from "react-bootstrap";
import "./ColorPicker.css";

const colors = [
  [255, 0, 0], // Red
  [0, 255, 0], // Green
  [0, 0, 255], // Blue
  [255, 255, 0], // Yellow
  [255, 165, 0], // Orange
  [238, 130, 238], // Violet
  [75, 0, 130], // Indigo
  [0, 255, 255], // Cyan
  [255, 192, 203], // Pink
  [128, 128, 128], // Gray
];

const ColorPicker = ({ show, handleClose, handleColorSelect }) => {
  const [selectedColor, setSelectedColor] = useState(null);

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleUpdateClick = () => {
    if (selectedColor) {
      handleColorSelect(selectedColor);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select a Color</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            {colors.map((color, index) => (
              <Col key={index} xs={6} md={4} className="color-container">
                <div
                  className="color-box"
                  style={{ backgroundColor: `rgb(${color.join(",")})` }}
                  onClick={() => handleColorClick(color)}
                ></div>
              </Col>
            ))}
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleUpdateClick}>
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ColorPicker;
