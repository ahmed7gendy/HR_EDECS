import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Rate, Space, message, Row, Col, Statistic } from 'antd';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const TrainingEvaluation = () => {
  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalEvaluations: 0,
    completionRate: 0,
  });

  useEffect(() => {
    fetchTrainingPrograms();
    fetchEvaluations();
  }, []);

  const fetchTrainingPrograms = async () => {
    try {
      const q = query(collection(db, 'trainingPrograms'));
      const querySnapshot = await getDocs(q);
      const programs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrainingPrograms(programs);
    } catch (error) {
      console.error('Error fetching training programs:', error);
      message.error('Failed to fetch training programs');
    }
  };

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'trainingEvaluations'));
      const querySnapshot = await getDocs(q);
      const evaluationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvaluations(evaluationsData);

      // Calculate statistics
      const totalEvaluations = evaluationsData.length;
      const averageRating = totalEvaluations > 0
        ? evaluationsData.reduce((acc, evaluation) => acc + evaluation.rating, 0) / totalEvaluations
        : 0;
      const completedEvaluations = evaluationsData.filter(e => e.status === 'completed').length;
      const completionRate = totalEvaluations > 0
        ? (completedEvaluations / totalEvaluations) * 100
        : 0;

      setStats({
        averageRating,
        totalEvaluations,
        completionRate,
      });
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      message.error('Failed to fetch evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvaluation = async (values) => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'trainingEvaluations'), {
        ...values,
        createdAt: new Date(),
        status: 'completed',
      });
      message.success('Evaluation added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchEvaluations();
    } catch (error) {
      console.error('Error adding evaluation:', error);
      message.error('Failed to add evaluation');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvaluation = async (values) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'trainingEvaluations', editingEvaluation.id), values);
      message.success('Evaluation updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setEditingEvaluation(null);
      fetchEvaluations();
    } catch (error) {
      console.error('Error updating evaluation:', error);
      message.error('Failed to update evaluation');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evaluation) => {
    setEditingEvaluation(evaluation);
    form.setFieldsValue(evaluation);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Training Program',
      dataIndex: 'programId',
      key: 'programId',
      render: (programId) => {
        const program = trainingPrograms.find(p => p.id === programId);
        return program ? program.title : 'Unknown Program';
      },
    },
    {
      title: 'Participant',
      dataIndex: 'participantName',
      key: 'participantName',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`status-${status.toLowerCase()}`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Training Evaluation</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditingEvaluation(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Add Evaluation
        </Button>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Average Rating"
              value={stats.averageRating}
              precision={1}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Evaluations"
              value={stats.totalEvaluations}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={stats.completionRate}
              suffix="%"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={evaluations}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingEvaluation ? 'Edit Evaluation' : 'Add Evaluation'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingEvaluation(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingEvaluation ? handleUpdateEvaluation : handleAddEvaluation}
        >
          <Form.Item
            name="programId"
            label="Training Program"
            rules={[{ required: true, message: 'Please select training program' }]}
          >
            <Select>
              {trainingPrograms.map(program => (
                <Option key={program.id} value={program.id}>
                  {program.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="participantName"
            label="Participant Name"
            rules={[{ required: true, message: 'Please enter participant name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please provide a rating' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="feedback"
            label="Feedback"
            rules={[{ required: true, message: 'Please provide feedback' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="suggestions"
            label="Suggestions for Improvement"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingEvaluation(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingEvaluation ? 'Update' : 'Add'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TrainingEvaluation; 