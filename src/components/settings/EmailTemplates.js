import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Tag, Typography, message, Tabs, Tooltip } from 'antd';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const EmailTemplates = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, [activeTab]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      let q = query(collection(db, 'emailTemplates'));

      if (activeTab !== 'all') {
        q = query(q, where('type', '==', activeTab));
      }

      const querySnapshot = await getDocs(q);
      const templatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      message.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = async (values) => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'emailTemplates'), {
        ...values,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      message.success('Template added successfully');
      form.resetFields();
      setIsModalVisible(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error adding template:', error);
      message.error('Failed to add template');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async (values) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'emailTemplates', selectedTemplate.id), {
        ...values,
        updatedAt: new Date(),
      });
      message.success('Template updated successfully');
      form.resetFields();
      setIsModalVisible(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      message.error('Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (template) => {
    try {
      await deleteDoc(doc(db, 'emailTemplates', template.id));
      message.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      message.error('Failed to delete template');
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    form.setFieldsValue(template);
    setIsModalVisible(true);
  };

  const handlePreview = (template) => {
    setPreviewContent(template.content);
    setPreviewVisible(true);
  };

  const handleDuplicate = async (template) => {
    try {
      setLoading(true);
      const { id, ...templateData } = template;
      await addDoc(collection(db, 'emailTemplates'), {
        ...templateData,
        name: `${template.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      message.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      message.error('Failed to duplicate template');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'notification': return 'blue';
      case 'alert': return 'red';
      case 'reminder': return 'orange';
      case 'welcome': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Last Modified',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Preview">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteTemplate(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Email Templates</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedTemplate(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Add Template
        </Button>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="All Templates" key="all" />
          <TabPane tab="Notifications" key="notification" />
          <TabPane tab="Alerts" key="alert" />
          <TabPane tab="Reminders" key="reminder" />
          <TabPane tab="Welcome" key="welcome" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} templates`,
          }}
        />
      </Card>

      <Modal
        title={selectedTemplate ? 'Edit Template' : 'Add Template'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedTemplate(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedTemplate ? handleUpdateTemplate : handleAddTemplate}
        >
          <Form.Item
            name="name"
            label="Template Name"
            rules={[{ required: true, message: 'Please enter template name' }]}
          >
            <Input placeholder="Enter template name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Template Type"
            rules={[{ required: true, message: 'Please select template type' }]}
          >
            <Select placeholder="Select template type">
              <Option value="notification">Notification</Option>
              <Option value="alert">Alert</Option>
              <Option value="reminder">Reminder</Option>
              <Option value="welcome">Welcome</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Email Subject"
            rules={[{ required: true, message: 'Please enter email subject' }]}
          >
            <Input placeholder="Enter email subject" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Email Content"
            rules={[{ required: true, message: 'Please enter email content' }]}
          >
            <TextArea
              rows={10}
              placeholder="Enter email content. Use {{variable}} for dynamic content."
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {selectedTemplate ? 'Update Template' : 'Add Template'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Template Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <div className="whitespace-pre-wrap font-mono">
          {previewContent}
        </div>
      </Modal>
    </div>
  );
};

export default EmailTemplates; 