import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Upload, message, Space, Tag } from 'antd';
import { UploadOutlined, DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const { Option } = Select;
const { TextArea } = Input;

const TrainingMaterials = () => {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'trainingMaterials'));
      const querySnapshot = await getDocs(q);
      const materialsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching materials:', error);
      message.error('Failed to fetch training materials');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      const storageRef = ref(storage, `training-materials/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleAddMaterial = async (values) => {
    try {
      setLoading(true);
      let fileUrl = '';
      if (fileList.length > 0) {
        fileUrl = await handleUpload(fileList[0]);
      }

      await addDoc(collection(db, 'trainingMaterials'), {
        ...values,
        fileUrl,
        createdAt: new Date(),
        status: 'active',
      });
      message.success('Material added successfully');
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchMaterials();
    } catch (error) {
      console.error('Error adding material:', error);
      message.error('Failed to add material');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMaterial = async (values) => {
    try {
      setLoading(true);
      let fileUrl = editingMaterial.fileUrl;
      if (fileList.length > 0) {
        // Delete old file if exists
        if (editingMaterial.fileUrl) {
          const oldFileRef = ref(storage, editingMaterial.fileUrl);
          await deleteObject(oldFileRef);
        }
        fileUrl = await handleUpload(fileList[0]);
      }

      await updateDoc(doc(db, 'trainingMaterials', editingMaterial.id), {
        ...values,
        fileUrl,
      });
      message.success('Material updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      setEditingMaterial(null);
      fetchMaterials();
    } catch (error) {
      console.error('Error updating material:', error);
      message.error('Failed to update material');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (material) => {
    try {
      setLoading(true);
      // Delete file from storage if exists
      if (material.fileUrl) {
        const fileRef = ref(storage, material.fileUrl);
        await deleteObject(fileRef);
      }
      // Delete document from Firestore
      await deleteDoc(doc(db, 'trainingMaterials', material.id));
      message.success('Material deleted successfully');
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      message.error('Failed to delete material');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    form.setFieldsValue(material);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'document' ? 'blue' : type === 'video' ? 'red' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
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
          <Button
            type="link"
            icon={<DownloadOutlined />}
            href={record.fileUrl}
            target="_blank"
            disabled={!record.fileUrl}
          >
            Download
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteMaterial(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Training Materials</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditingMaterial(null);
            form.resetFields();
            setFileList([]);
            setIsModalVisible(true);
          }}
        >
          Add Material
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={materials}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingMaterial ? 'Edit Material' : 'Add Material'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
          setEditingMaterial(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingMaterial ? handleUpdateMaterial : handleAddMaterial}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter material title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select material type' }]}
          >
            <Select>
              <Option value="document">Document</Option>
              <Option value="video">Video</Option>
              <Option value="presentation">Presentation</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              <Option value="technical">Technical</Option>
              <Option value="soft-skills">Soft Skills</Option>
              <Option value="compliance">Compliance</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="File"
            required={!editingMaterial}
          >
            <Upload
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
              onRemove={() => setFileList([])}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setFileList([]);
                setEditingMaterial(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingMaterial ? 'Update' : 'Add'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TrainingMaterials; 