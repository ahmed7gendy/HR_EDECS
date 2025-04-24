import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Progress, Tag, Space, message } from 'antd';
import { collection, query, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const PerformanceGoals = () => {
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingGoal, setEditingGoal] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchGoals();
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

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'performanceGoals'));
      const querySnapshot = await getDocs(q);
      const goalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(goalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
      message.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (values) => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'performanceGoals'), {
        ...values,
        createdAt: new Date(),
        status: 'in-progress',
        progress: 0,
      });
      message.success('Goal added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      message.error('Failed to add goal');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = async (values) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'performanceGoals', editingGoal.id), values);
      message.success('Goal updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setEditingGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      message.error('Failed to update goal');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    form.setFieldsValue({
      ...goal,
      targetDate: goal.targetDate ? dayjs(goal.targetDate) : null,
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
      title: 'Goal',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={category === 'professional' ? 'blue' : 'green'}>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: 'Target Date',
      dataIndex: 'targetDate',
      key: 'targetDate',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'red'}>
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Performance Goals</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditingGoal(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Add Goal
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={goals}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingGoal ? 'Edit Goal' : 'Add Goal'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingGoal(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingGoal ? handleUpdateGoal : handleAddGoal}
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
            name="title"
            label="Goal Title"
            rules={[{ required: true, message: 'Please enter goal title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              <Option value="professional">Professional</Option>
              <Option value="personal">Personal</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter goal description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="targetDate"
            label="Target Date"
            rules={[{ required: true, message: 'Please select target date' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          {editingGoal && (
            <Form.Item
              name="progress"
              label="Progress"
              rules={[{ required: true, message: 'Please enter progress' }]}
            >
              <Input type="number" min={0} max={100} />
            </Form.Item>
          )}

          {editingGoal && (
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select>
                <Option value="in-progress">In Progress</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingGoal(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingGoal ? 'Update' : 'Add'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PerformanceGoals; 