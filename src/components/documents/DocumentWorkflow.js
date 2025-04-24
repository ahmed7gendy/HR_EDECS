import React, { useState, useEffect } from 'react';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Table, Tag, Space, Typography, Button, Modal, Form, Input, Select, Steps, Tooltip, Popconfirm } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

const DocumentWorkflow = ({ documentId }) => {
  const { showSnackbar } = useSnackbar();
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (documentId) {
      fetchWorkflows();
      fetchUsers();
    }
  }, [documentId]);

  const fetchWorkflows = async () => {
    try {
      const workflowsQuery = query(
        collection(db, 'documentWorkflows'),
        where('documentId', '==', documentId)
      );
      const querySnapshot = await getDocs(workflowsQuery);
      const workflowsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkflows(workflowsData);
    } catch (error) {
      showSnackbar('error', 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      showSnackbar('error', 'Failed to load users');
    }
  };

  const handleCreateWorkflow = async (values) => {
    try {
      await addDoc(collection(db, 'documentWorkflows'), {
        documentId,
        name: values.name,
        steps: values.steps.map(step => ({
          ...step,
          status: 'pending',
          completedAt: null,
          completedBy: null
        })),
        status: 'active',
        createdBy: 'currentUserId', // Replace with actual current user ID
        createdAt: new Date().toISOString()
      });
      showSnackbar('success', 'Workflow created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchWorkflows();
    } catch (error) {
      showSnackbar('error', 'Failed to create workflow');
    }
  };

  const handleUpdateStep = async (workflowId, stepIndex, action) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      const updatedSteps = [...workflow.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        status: action,
        completedAt: new Date().toISOString(),
        completedBy: 'currentUserId' // Replace with actual current user ID
      };

      await updateDoc(doc(db, 'documentWorkflows', workflowId), {
        steps: updatedSteps,
        status: updatedSteps.every(step => step.status === 'approved') ? 'completed' : 'active'
      });
      showSnackbar('success', 'Step updated successfully');
      fetchWorkflows();
    } catch (error) {
      showSnackbar('error', 'Failed to update step');
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    try {
      await updateDoc(doc(db, 'documentWorkflows', workflowId), {
        status: 'deleted',
        deletedAt: new Date().toISOString(),
        deletedBy: 'currentUserId' // Replace with actual current user ID
      });
      showSnackbar('success', 'Workflow deleted successfully');
      fetchWorkflows();
    } catch (error) {
      showSnackbar('error', 'Failed to delete workflow');
    }
  };

  const renderSteps = (steps) => {
    return (
      <Steps
        current={steps.findIndex(step => step.status === 'pending')}
        status={steps.every(step => step.status === 'approved') ? 'finish' : 'process'}
      >
        {steps.map((step, index) => (
          <Steps.Step
            key={index}
            title={step.name}
            description={step.assignedTo}
            icon={
              step.status === 'approved' ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : step.status === 'rejected' ? (
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              ) : (
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
              )
            }
          />
        ))}
      </Steps>
    );
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'success' :
          status === 'active' ? 'processing' :
          'default'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy) => (
        <Space>
          <UserOutlined />
          <Text>{createdBy}</Text>
        </Space>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (timestamp) => (
        <Text type="secondary">
          {dayjs(timestamp).format('YYYY-MM-DD HH:mm')}
        </Text>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Steps">
            <Button
              type="text"
              onClick={() => {
                setSelectedWorkflow(record);
                setModalVisible(true);
              }}
            >
              View Steps
            </Button>
          </Tooltip>
          {record.status === 'active' && (
            <Popconfirm
              title="Are you sure you want to delete this workflow?"
              onConfirm={() => handleDeleteWorkflow(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => {
            setSelectedWorkflow(null);
            setModalVisible(true);
          }}
        >
          Create Workflow
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={workflows}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} workflows`
        }}
      />

      <Modal
        title={selectedWorkflow ? 'Workflow Steps' : 'Create Workflow'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        {selectedWorkflow ? (
          <div>
            {renderSteps(selectedWorkflow.steps)}
            <div style={{ marginTop: 24 }}>
              <Table
                dataSource={selectedWorkflow.steps}
                pagination={false}
                columns={[
                  {
                    title: 'Step',
                    dataIndex: 'name',
                    key: 'name'
                  },
                  {
                    title: 'Assigned To',
                    dataIndex: 'assignedTo',
                    key: 'assignedTo'
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      <Tag color={
                        status === 'approved' ? 'success' :
                        status === 'rejected' ? 'error' :
                        'processing'
                      }>
                        {status}
                      </Tag>
                    )
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record, index) => (
                      record.status === 'pending' && (
                        <Space>
                          <Button
                            type="primary"
                            onClick={() => handleUpdateStep(selectedWorkflow.id, index, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            danger
                            onClick={() => handleUpdateStep(selectedWorkflow.id, index, 'rejected')}
                          >
                            Reject
                          </Button>
                        </Space>
                      )
                    )
                  }
                ]}
              />
            </div>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateWorkflow}
          >
            <Form.Item
              name="name"
              label="Workflow Name"
              rules={[{ required: true, message: 'Please enter a name' }]}
            >
              <Input placeholder="Enter workflow name" />
            </Form.Item>

            <Form.List name="steps">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div key={field.key} style={{ marginBottom: 16 }}>
                      <Space align="baseline">
                        <Form.Item
                          {...field}
                          name={[field.name, 'name']}
                          fieldKey={[field.fieldKey, 'name']}
                          rules={[{ required: true, message: 'Missing step name' }]}
                        >
                          <Input placeholder="Step name" />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'assignedTo']}
                          fieldKey={[field.fieldKey, 'assignedTo']}
                          rules={[{ required: true, message: 'Missing assignee' }]}
                        >
                          <Select
                            style={{ width: 200 }}
                            placeholder="Select assignee"
                          >
                            {users.map(user => (
                              <Option key={user.id} value={user.id}>
                                {user.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Button type="link" onClick={() => remove(field.name)}>
                          Remove
                        </Button>
                      </Space>
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      Add Step
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create Workflow
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default DocumentWorkflow; 