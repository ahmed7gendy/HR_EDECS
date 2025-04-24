import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Tag, Space, message, Upload, Tooltip, Tabs } from 'antd';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { UploadOutlined, DownloadOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const DocumentTemplates = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [templateContent, setTemplateContent] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'documentTemplates'));
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

  const handleUpload = async (file) => {
    try {
      setLoading(true);
      const storageRef = ref(storage, `templates/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = async (values) => {
    try {
      setLoading(true);
      const file = fileList[0]?.originFileObj;
      if (!file) {
        message.error('Please upload a template file');
        return;
      }

      const downloadURL = await handleUpload(file);
      const templateData = {
        ...values,
        fileUrl: downloadURL,
        fileName: file.name,
        createdAt: new Date().toISOString(),
        createdBy: 'currentUser', // Replace with actual user
        versions: [{
          version: '1.0',
          fileUrl: downloadURL,
          fileName: file.name,
          createdAt: new Date().toISOString(),
          createdBy: 'currentUser', // Replace with actual user
        }],
      };

      await addDoc(collection(db, 'documentTemplates'), templateData);
      message.success('Template added successfully');
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
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
      const templateRef = doc(db, 'documentTemplates', selectedTemplate.id);
      const file = fileList[0]?.originFileObj;
      let updateData = { ...values };

      if (file) {
        const downloadURL = await handleUpload(file);
        updateData = {
          ...updateData,
          fileUrl: downloadURL,
          fileName: file.name,
          versions: [
            ...selectedTemplate.versions,
            {
              version: (parseFloat(selectedTemplate.versions[selectedTemplate.versions.length - 1].version) + 0.1).toFixed(1),
              fileUrl: downloadURL,
              fileName: file.name,
              createdAt: new Date().toISOString(),
              createdBy: 'currentUser', // Replace with actual user
            },
          ],
        };
      }

      await updateDoc(templateRef, updateData);
      message.success('Template updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
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
      // Delete file from storage
      const storageRef = ref(storage, template.fileUrl);
      await deleteObject(storageRef);

      // Delete template from Firestore
      await deleteDoc(doc(db, 'documentTemplates', template.id));
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
      category: template.category,
      description: template.description,
    });
    setIsModalVisible(true);
  };

  const handlePreview = async (template) => {
    try {
      setLoading(true);
      const response = await fetch(template.fileUrl);
      const content = await response.text();
      setTemplateContent(content);
      setSelectedTemplate(template);
      setIsPreviewModalVisible(true);
    } catch (error) {
      console.error('Error previewing template:', error);
      message.error('Failed to preview template');
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
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        render: (category) => (
          <Tag color={category === 'policy' ? 'blue' : category === 'form' ? 'green' : 'orange'}>
            {category}
          </Tag>
        ),
      },
      {
        title: 'Current Version',
        dataIndex: 'versions',
        key: 'version',
        render: (versions) => versions[versions.length - 1].version,
      },
      {
        title: 'Last Updated',
        dataIndex: 'versions',
        key: 'updatedAt',
        render: (versions) => dayjs(versions[versions.length - 1].createdAt).format('MMM DD, YYYY'),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Tooltip title="Preview">
              <Button
                type="text"
                icon={<DownloadOutlined />}
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
        <h1 className="text-2xl font-bold">Document Templates</h1>
        <Button
          type="primary"
          onClick={() => {
            setSelectedTemplate(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Add Template
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
        <TabPane tab="Policies" key="policy">
          <Table
            columns={getTemplateColumns()}
            dataSource={templates.filter(t => t.category === 'policy')}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        <TabPane tab="Forms" key="form">
          <Table
            columns={getTemplateColumns()}
            dataSource={templates.filter(t => t.category === 'form')}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={selectedTemplate ? 'Edit Template' : 'Add Template'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedTemplate(null);
          setFileList([]);
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
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              <Option value="policy">Policy</Option>
              <Option value="form">Form</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Template File"
            required={!selectedTemplate}
          >
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setSelectedTemplate(null);
                setFileList([]);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedTemplate ? 'Update' : 'Add'}
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
            </div>
            <div className="border rounded p-4 bg-gray-50">
              <pre className="whitespace-pre-wrap">{templateContent}</pre>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => window.open(selectedTemplate.fileUrl, '_blank')}
              >
                Download Template
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentTemplates; 