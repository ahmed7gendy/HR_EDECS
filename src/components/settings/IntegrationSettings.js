import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Tag, Space, message, Tabs, Tooltip, Divider, Switch } from 'antd';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ApiOutlined, SyncOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const IntegrationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'integrations'));
      const querySnapshot = await getDocs(q);
      const integrationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIntegrations(integrationsData);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      message.error('Failed to fetch integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntegration = async (values) => {
    try {
      setLoading(true);
      const integrationData = {
        ...values,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'currentUser', // Replace with actual user
        lastModified: new Date().toISOString(),
        lastSync: null,
      };

      await addDoc(collection(db, 'integrations'), integrationData);
      message.success('Integration created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchIntegrations();
    } catch (error) {
      console.error('Error creating integration:', error);
      message.error('Failed to create integration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIntegration = async (values) => {
    try {
      setLoading(true);
      const integrationRef = doc(db, 'integrations', selectedIntegration.id);
      await updateDoc(integrationRef, {
        ...values,
        lastModified: new Date().toISOString(),
      });
      message.success('Integration updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setSelectedIntegration(null);
      fetchIntegrations();
    } catch (error) {
      console.error('Error updating integration:', error);
      message.error('Failed to update integration');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIntegration = async (integration) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'integrations', integration.id));
      message.success('Integration deleted successfully');
      fetchIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      message.error('Failed to delete integration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (integration) => {
    try {
      setLoading(true);
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult({
        success: true,
        message: 'Connection successful',
        timestamp: new Date().toISOString(),
      });
      message.success('Connection test successful');
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection failed',
        timestamp: new Date().toISOString(),
      });
      message.error('Connection test failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (integration) => {
    try {
      setLoading(true);
      const integrationRef = doc(db, 'integrations', integration.id);
      await updateDoc(integrationRef, {
        isActive: !integration.isActive,
        lastModified: new Date().toISOString(),
      });
      message.success(`Integration ${!integration.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      message.error('Failed to toggle integration');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (integration) => {
    setSelectedIntegration(integration);
    form.setFieldsValue({
      name: integration.name,
      type: integration.type,
      apiKey: integration.apiKey,
      apiSecret: integration.apiSecret,
      endpoint: integration.endpoint,
      isActive: integration.isActive,
    });
    setIsModalVisible(true);
  };

  const getIntegrationColumns = () => {
    return [
      {
        title: 'Integration Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type) => (
          <Tag color={type === 'payment' ? 'green' : type === 'hr' ? 'blue' : 'orange'}>
            {type}
          </Tag>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'status',
        render: (isActive) => (
          <Switch
            checked={isActive}
            onChange={() => handleToggleActive(selectedIntegration)}
          />
        ),
      },
      {
        title: 'Last Sync',
        dataIndex: 'lastSync',
        key: 'lastSync',
        render: (date) => date ? dayjs(date).format('MMM DD, YYYY HH:mm') : 'Never',
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Tooltip title="Test Connection">
              <Button
                type="text"
                icon={<SyncOutlined />}
                onClick={() => handleTestConnection(record)}
              />
            </Tooltip>
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
                onClick={() => handleDeleteIntegration(record)}
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
        <h1 className="text-2xl font-bold">Integration Settings</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedIntegration(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Add Integration
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="All Integrations" key="all">
          <Table
            columns={getIntegrationColumns()}
            dataSource={integrations}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        <TabPane tab="Payment Integrations" key="payment">
          <Table
            columns={getIntegrationColumns()}
            dataSource={integrations.filter(i => i.type === 'payment')}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        <TabPane tab="HR Integrations" key="hr">
          <Table
            columns={getIntegrationColumns()}
            dataSource={integrations.filter(i => i.type === 'hr')}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={selectedIntegration ? 'Edit Integration' : 'Add Integration'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedIntegration(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedIntegration ? handleUpdateIntegration : handleAddIntegration}
        >
          <Form.Item
            name="name"
            label="Integration Name"
            rules={[{ required: true, message: 'Please enter integration name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Integration Type"
            rules={[{ required: true, message: 'Please select integration type' }]}
          >
            <Select>
              <Option value="payment">Payment Gateway</Option>
              <Option value="hr">HR System</Option>
              <Option value="accounting">Accounting Software</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="endpoint"
            label="API Endpoint"
            rules={[{ required: true, message: 'Please enter API endpoint' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API Key"
            rules={[{ required: true, message: 'Please enter API key' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="apiSecret"
            label="API Secret"
            rules={[{ required: true, message: 'Please enter API secret' }]}
          >
            <Input.Password />
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
                setSelectedIntegration(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedIntegration ? 'Update' : 'Add'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {testResult && (
        <Modal
          title="Connection Test Result"
          open={!!testResult}
          onCancel={() => setTestResult(null)}
          footer={null}
        >
          <div className="p-4">
            <div className={`mb-4 p-4 rounded ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center">
                <Tag color={testResult.success ? 'success' : 'error'}>
                  {testResult.success ? 'Success' : 'Failed'}
                </Tag>
                <span className="ml-2">{testResult.message}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Tested at: {dayjs(testResult.timestamp).format('MMM DD, YYYY HH:mm:ss')}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default IntegrationSettings; 