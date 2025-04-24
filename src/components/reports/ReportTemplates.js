import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Tag, Space, message, Tabs, Tooltip, Divider } from 'antd';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ReportTemplates = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [templateContent, setTemplateContent] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'reportTemplates'));
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
      const templateData = {
        ...values,
        createdAt: new Date().toISOString(),
        createdBy: 'currentUser', // Replace with actual user
        lastModified: new Date().toISOString(),
        version: '1.0',
      };

      await addDoc(collection(db, 'reportTemplates'), templateData);
      message.success('Template created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      message.error('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async (values) => {
    try {
      setLoading(true);
      const templateRef = doc(db, 'reportTemplates', selectedTemplate.id);
      const currentVersion = parseFloat(selectedTemplate.version);
      await updateDoc(templateRef, {
        ...values,
        lastModified: new Date().toISOString(),
        version: (currentVersion + 0.1).toFixed(1),
      });
      message.success('Template updated successfully');
      setIsModalVisible(false);
      form.resetFields();
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
      setLoading(true);
      await deleteDoc(doc(db, 'reportTemplates', template.id));
      message.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      message.error('Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    form.setFieldsValue({
      name: template.name,
      type: template.type,
      description: template.description,
      layout: template.layout,
      fields: template.fields,
    });
    setIsModalVisible(true);
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setTemplateContent(template.layout);
    setIsPreviewModalVisible(true);
  };

  const handleDuplicate = async (template) => {
    try {
      setLoading(true);
      const newTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        createdAt: new Date().toISOString(),
        createdBy: 'currentUser', // Replace with actual user
        lastModified: new Date().toISOString(),
        version: '1.0',
      };
      delete newTemplate.id;

      await addDoc(collection(db, 'reportTemplates'), newTemplate);
      message.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      message.error('Failed to duplicate template');
    } finally {
      setLoading(false);
    }
  };

  const getTemplateColumns = () => {
    return [
      {
        title: 'Template Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type) => (
          <Tag color={type === 'employee' ? 'blue' : type === 'project' ? 'green' : 'orange'}>
            {type}
          </Tag>
        ),
      },
      {
        title: 'Version',
        dataIndex: 'version',
        key: 'version',
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
            <Tooltip title="Preview">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(record)}
              />
            </Tooltip>
            <Tooltip title="Duplicate">
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => handleDuplicate(record)}
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
                onClick={() => handleDeleteTemplate(record)}
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
        <h1 className="text-2xl font-bold">Report Templates</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedTemplate(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Create Template
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="All Templates" key="all">
          <Table
            columns={getTemplateColumns()}
            dataSource={templates}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        <TabPane tab="Employee Reports" key="employee">
          <Table
            columns={getTemplateColumns()}
            dataSource={templates.filter(t => t.type === 'employee')}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        <TabPane tab="Project Reports" key="project">
          <Table
            columns={getTemplateColumns()}
            dataSource={templates.filter(t => t.type === 'project')}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={selectedTemplate ? 'Edit Template' : 'Create Template'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedTemplate(null);
        }}
        footer={null}
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
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Template Type"
            rules={[{ required: true, message: 'Please select template type' }]}
          >
            <Select>
              <Option value="employee">Employee Report</Option>
              <Option value="project">Project Report</Option>
              <Option value="financial">Financial Report</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="layout"
            label="Layout"
            rules={[{ required: true, message: 'Please enter layout' }]}
          >
            <TextArea rows={8} />
          </Form.Item>

          <Form.Item
            name="fields"
            label="Fields"
            rules={[{ required: true, message: 'Please select fields' }]}
          >
            <Select mode="multiple" placeholder="Select fields">
              <Option value="name">Name</Option>
              <Option value="department">Department</Option>
              <Option value="position">Position</Option>
              <Option value="status">Status</Option>
              <Option value="date">Date</Option>
              <Option value="amount">Amount</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setSelectedTemplate(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedTemplate ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Template Preview"
        open={isPreviewModalVisible}
        onCancel={() => {
          setIsPreviewModalVisible(false);
          setSelectedTemplate(null);
          setTemplateContent('');
        }}
        width={800}
        footer={null}
      >
        {selectedTemplate && (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
              <p className="text-gray-600">{selectedTemplate.description}</p>
              <div className="mt-2">
                <Tag color="blue">Version {selectedTemplate.version}</Tag>
                <Tag color="green">{selectedTemplate.type}</Tag>
              </div>
            </div>
            <Divider />
            <div className="border rounded p-4 bg-gray-50">
              <pre className="whitespace-pre-wrap">{templateContent}</pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportTemplates; 