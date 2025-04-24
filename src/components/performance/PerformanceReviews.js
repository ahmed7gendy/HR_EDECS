import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Rate, Tag, Space, message, Steps } from 'antd';
import { collection, query, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const PerformanceReviews = () => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingReview, setEditingReview] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    fetchEmployees();
    fetchReviews();
  }, []);

  const fetchEmployees = async () => {
    try {
      const q = query(collection(db, 'employees'));
      const querySnapshot = await getDocs(q);
      const employeesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to fetch employees');
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'performanceReviews'));
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (values) => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'performanceReviews'), {
        ...values,
        createdAt: new Date(),
        status: 'draft',
        currentStep: 0,
      });
      message.success('Review added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchReviews();
    } catch (error) {
      console.error('Error adding review:', error);
      message.error('Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReview = async (values) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'performanceReviews', editingReview.id), {
        ...values,
        updatedAt: new Date(),
      });
      message.success('Review updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      message.error('Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    form.setFieldsValue({
      ...review,
      reviewDate: review.reviewDate ? dayjs(review.reviewDate) : null,
    });
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (employeeId) => {
        const employee = employees.find(e => e.id === employeeId);
        return employee ? employee.name : 'Unknown Employee';
      },
    },
    {
      title: 'Review Type',
      dataIndex: 'reviewType',
      key: 'reviewType',
      render: (type) => (
        <Tag color={type === 'annual' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Rate disabled defaultValue={rating} />
      ),
    },
    {
      title: 'Review Date',
      dataIndex: 'reviewDate',
      key: 'reviewDate',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'in-progress' ? 'blue' :
          status === 'draft' ? 'orange' : 'red'
        }>
          {status}
        </Tag>
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

  const steps = [
    {
      title: 'Self Assessment',
      content: (
        <Form.Item
          name="selfAssessment"
          label="Self Assessment"
          rules={[{ required: true, message: 'Please enter self assessment' }]}
        >
          <TextArea rows={4} />
        </Form.Item>
      ),
    },
    {
      title: 'Manager Review',
      content: (
        <>
          <Form.Item
            name="managerAssessment"
            label="Manager Assessment"
            rules={[{ required: true, message: 'Please enter manager assessment' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please provide a rating' }]}
          >
            <Rate />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Development Plan',
      content: (
        <Form.Item
          name="developmentPlan"
          label="Development Plan"
          rules={[{ required: true, message: 'Please enter development plan' }]}
        >
          <TextArea rows={4} />
        </Form.Item>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Performance Reviews</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditingReview(null);
            form.resetFields();
            setCurrentStep(0);
            setIsModalVisible(true);
          }}
        >
          Add Review
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingReview ? 'Edit Review' : 'Add Review'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingReview(null);
          setCurrentStep(0);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingReview ? handleUpdateReview : handleAddReview}
        >
          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: true, message: 'Please select employee' }]}
          >
            <Select>
              {employees.map(employee => (
                <Option key={employee.id} value={employee.id}>
                  {employee.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="reviewType"
            label="Review Type"
            rules={[{ required: true, message: 'Please select review type' }]}
          >
            <Select>
              <Option value="annual">Annual Review</Option>
              <Option value="quarterly">Quarterly Review</Option>
              <Option value="probation">Probation Review</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reviewDate"
            label="Review Date"
            rules={[{ required: true, message: 'Please select review date' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Steps current={currentStep} className="mb-6">
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>

          {steps[currentStep].content}

          <div className="flex justify-between mt-6">
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            ) : (
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingReview ? 'Update' : 'Add'}
              </Button>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PerformanceReviews; 