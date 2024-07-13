import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Setup.css';

const Setup = ({fetchData}) => {
  const [newGroupId, setNewGroupId] = useState('');
  const [groupIdForWrack, setGroupIdForWrack] = useState('');
  const [newWrackId, setNewWrackId] = useState('');
  const [groupIdForSchedule, setGroupIdForSchedule] = useState('');
  const [wrackIdForSchedule, setWrackIdForSchedule] = useState('');
  const [binIdForSchedule, setBinIdForSchedule] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const notify = (message, type) => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    fetchData();
  };

  

  const handleAddGroup = () => {
    axios.post('http://localhost:5000/new/group', { newGroupid: newGroupId })
      .then(response => {
        notify('Group added successfully!', 'success');
        setNewGroupId('');
      })
      .catch(error => notify('Failed to add group', 'error'));
  };

  const handleAddWrack = () => {
    axios.post('http://localhost:5000/new/wrack', { Groupid: groupIdForWrack, newWrackid: newWrackId })
      .then(response => {
        notify('Wrack added successfully!', 'success');
        setGroupIdForWrack('');
        setNewWrackId('');
      })
      .catch(error => notify('Failed to add wrack', 'error'));
  };

  const handleAddSchedule = () => {
    const newSchedule = { time: scheduleTime, enabled: false };
    axios.post('http://localhost:5000/new/schedule', { group_id: groupIdForSchedule, wrack_id: wrackIdForSchedule, bin_id: binIdForSchedule, new_schduled: newSchedule })
      .then(response => {
        notify('Schedule added successfully!', 'success');
        setGroupIdForSchedule('');
        setWrackIdForSchedule('');
        setBinIdForSchedule('');
        setScheduleTime('');
      })
      .catch(error => notify('Failed to add schedule', 'error'));
  };

  return (
    <Container className="setup">
      <h1>Setup</h1>
      <ToastContainer />
      <Row>
        <Col md={4}>
          <Card className="setup-card">
            <Card.Body>
              <Card.Title>Add Group</Card.Title>
              <Form>
                <Form.Group controlId="newGroupId">
                  <Form.Label>New Group ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={newGroupId}
                    onChange={(e) => setNewGroupId(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleAddGroup}>Add Group</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="setup-card">
            <Card.Body>
              <Card.Title>Add Wrack</Card.Title>
              <Form>
                <Form.Group controlId="groupIdForWrack">
                  <Form.Label>Group ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={groupIdForWrack}
                    onChange={(e) => setGroupIdForWrack(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="newWrackId">
                  <Form.Label>New Wrack ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={newWrackId}
                    onChange={(e) => setNewWrackId(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleAddWrack}>Add Wrack</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="setup-card">
            <Card.Body>
              <Card.Title>Add Schedule</Card.Title>
              <Form>
                <Form.Group controlId="groupIdForSchedule">
                  <Form.Label>Group ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={groupIdForSchedule}
                    onChange={(e) => setGroupIdForSchedule(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="wrackIdForSchedule">
                  <Form.Label>Wrack ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={wrackIdForSchedule}
                    onChange={(e) => setWrackIdForSchedule(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="binIdForSchedule">
                  <Form.Label>Bin ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={binIdForSchedule}
                    onChange={(e) => setBinIdForSchedule(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="scheduleTime">
                  <Form.Label>Schedule Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleAddSchedule}>Add Schedule</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Setup;
