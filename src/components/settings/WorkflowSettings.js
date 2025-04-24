import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Tag, Space, message, Tabs, Tooltip, Divider, Switch } from 'antd';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const WorkflowSettings = () => {
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchWorkflows();
    fetchRoles();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'workflows'));
      const querySnapshot = await getDocs(q);
      const workflowsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWorkflows(workflowsData);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      message.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const q = query(collection(db, 'roles'));
      const querySnapshot = await getDocs(q);
      const rolesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
      message.error('Failed to fetch roles');
    }
  };

  const handleAddWorkflow = async (values) => {
    try {
      setLoading(true);
      const workflowData = {
        ...values,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'currentUser', // Replace with actual user
        lastModified: new Date().toISOString(),
      };

      await addDoc(collection(db, 'workflows'), workflowData);
      message.success('Workflow created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchWorkflows();
    } catch (error) {
      console.error('Error creating workflow:', error);
      message.error('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkflow = async (values) => {
    try {
      setLoading(true);
      const workflowRef = doc(db, 'workflows', selectedWorkflow.id);
      await updateDoc(workflowRef, {
        ...values,
        lastModified: new Date().toISOString(),
      });
      message.success('Workflow updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setSelectedWorkflow(null);
      fetchWorkflows();
    } catch (error) {
      console.error('Error updating workflow:', error);
      message.error('Failed to update workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = async (workflow) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'workflows', workflow.id));
      message.success('Workflow deleted successfully');
      fetchWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
      message.error('Failed to delete workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (workflow) => {
    try {
      setLoading(true);
      const workflowRef = doc(db, 'workflows', workflow.id);
      await updateDoc(workflowRef, {
        isActive: !workflow.isActive,
        lastModified: new Date().toISOString(),
      });
      message.success(`Workflow ${!workflow.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchWorkflows();
    } catch (error) {
      console.error('Error toggling workflow:', error);
      message.error('Failed to toggle workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workflow) => {
    setSelectedWorkflow(workflow);
    form.setFieldsValue({
      name: workflow.name,
      type: workflow.type,
      description: workflow.description,
      steps: workflow.steps,
      approvers: workflow.approvers,
      isActive: workflow.isActive,
    });
    setIsModalVisible(true);
  };

  const getWorkflowColumns = () => {
    return [
      {
        title: 'Workflow Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type) => (
          <Tag color={type === 'approval' ? 'blue' : type === 'notification' ? 'green' : 'orange'}>
            {type}
          </Tag>
        ),
      },
      {
        title: 'Steps',
        dataIndex: 'steps',
        key: 'steps',
        render: (steps) => steps?.length || 0,
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'status',
        render: (isActive) => (
          <Switch
            checked={isActive}
            onChange={() => handleToggleActive(selectedWorkflow)}
          />
        ),
      },
      {
        title: 'Last Modified',
        dataIndex: 'lastModified',
        key: 'lastModified',
        render: (date) => dayjs(date).format('MMM DD, YYYY'),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteWorkflow(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ];
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflow Settings</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedWorkflow(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Create Workflow
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="All Workflows" key="all">
          <Table
            columns={getWorkflowColumns()}
            dataSource={workflows}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        <TabPane tab="Approval Workflows" key="approval">
          <Table
            columns={getWorkflowColumns()}
            dataSource={workflows.filter(w => w.type === 'approval')}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        <TabPane tab="Notification Workflows" key="notification">
          <Table
            columns={getWorkflowColumns()}
            dataSource={workflows.filter(w => w.type === 'notification')}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={selectedWorkflow ? 'Edit Workflow' : 'Create Workflow'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedWorkflow(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedWorkflow ? handleUpdateWorkflow : handleAddWorkflow}
        >
          <Form.Item
            name="name"
            label="Workflow Name"
            rules={[{ required: true, message: 'Please enter workflow name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Workflow Type"
            rules={[{ required: true, message: 'Please select workflow type' }]}
          >
            <Select>
              <Option value="approval">Approval Workflow</Option>
              <Option value="notification">Notification Workflow</Option>
              <Option value="review">Review Workflow</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="steps"
            label="Workflow Steps"
            rules={[{ required: true, message: 'Please add at least one step' }]}
          >
            <Select mode="tags" placeholder="Add steps">
              <Option value="draft">Draft</Option>
              <Option value="review">Review</Option>
              <Option value="approval">Approval</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="approvers"
            label="Approvers"
            rules={[{ required: true, message: 'Please select approvers' }]}
          >
            <Select mode="multiple" placeholder="Select approvers">
              {roles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setSelectedWorkflow(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedWorkflow ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkflowSettings; 