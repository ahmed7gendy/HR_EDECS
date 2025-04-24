import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Tag, Space, message } from 'antd';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const CandidatePool = () => {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCandidate, setEditingCandidate] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'candidates'));
      const querySnapshot = await getDocs(q);
      const candidatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      message.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (values) => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'candidates'), {
        ...values,
        createdAt: new Date(),
        status: 'active',
      });
      message.success('Candidate added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchCandidates();
    } catch (error) {
      console.error('Error adding candidate:', error);
      message.error('Failed to add candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCandidate = async (values) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'candidates', editingCandidate.id), values);
      message.success('Candidate updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setEditingCandidate(null);
      fetchCandidates();
    } catch (error) {
      console.error('Error updating candidate:', error);
      message.error('Failed to update candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (candidate) => {
    setEditingCandidate(candidate);
    form.setFieldsValue(candidate);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Skills',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills) => (
        <Space>
          {skills?.map((skill, index) => (
            <Tag key={index} color="blue">
              {skill}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
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
        <h1 className="text-2xl font-bold">Candidate Pool</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditingCandidate(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Add Candidate
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={candidates}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingCandidate ? 'Edit Candidate' : 'Add Candidate'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingCandidate(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingCandidate ? handleUpdateCandidate : handleAddCandidate}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter candidate name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="skills"
            label="Skills"
            rules={[{ required: true, message: 'Please select skills' }]}
          >
            <Select mode="tags" placeholder="Select skills">
              <Option value="JavaScript">JavaScript</Option>
              <Option value="React">React</Option>
              <Option value="Node.js">Node.js</Option>
              <Option value="Python">Python</Option>
              <Option value="Java">Java</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingCandidate(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCandidate ? 'Update' : 'Add'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CandidatePool; 