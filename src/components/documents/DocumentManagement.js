import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { collection, query, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Table, Button, Modal, Form, Input, Upload, message } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const DocumentManagement = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const documentsQuery = query(collection(db, 'documents'));
      const querySnapshot = await getDocs(documentsQuery);
      const documentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(documentsList);
    } catch (error) {
      showSnackbar('error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (values) => {
    try {
      await addDoc(collection(db, 'documents'), {
        ...values,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid
      });
      showSnackbar('success', 'Document added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchDocuments();
    } catch (error) {
      showSnackbar('error', 'Failed to add document');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDoc(doc(db, 'documents', documentId));
      showSnackbar('success', 'Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      showSnackbar('error', 'Failed to delete document');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDocument(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => setIsModalVisible(true)}
        >
          Add Document
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={documents}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title="Add Document"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddDocument}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Document Name"
            rules={[{ required: true, message: 'Please input document name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="file"
            label="Document File"
            rules={[{ required: true, message: 'Please upload document!' }]}
          >
            <Upload>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentManagement; 