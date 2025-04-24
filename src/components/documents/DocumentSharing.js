import React, { useState, useEffect } from 'react';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Table, Tag, Space, Typography, Button, Modal, Form, Select, Input, Card, Tooltip, Switch, Popconfirm } from 'antd';
import { UserAddOutlined, EditOutlined, DeleteOutlined, ShareAltOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

const DocumentSharing = ({ documentId }) => {
  const { showSnackbar } = useSnackbar();
  const [shares, setShares] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedShare, setSelectedShare] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (documentId) {
      fetchShares();
      fetchUsers();
    }
  }, [documentId]);

  const fetchShares = async () => {
    try {
      const sharesQuery = query(
        collection(db, 'documentShares'),
        where('documentId', '==', documentId)
      );
      const querySnapshot = await getDocs(sharesQuery);
      const sharesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShares(sharesData);
    } catch (error) {
      showSnackbar('error', 'Failed to load shares');
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

  const handleShare = async (values) => {
    try {
      if (selectedShare) {
        await updateDoc(doc(db, 'documentShares', selectedShare.id), {
          ...values,
          updatedAt: new Date().toISOString()
        });
        showSnackbar('success', 'Share updated successfully');
      } else {
        await addDoc(collection(db, 'documentShares'), {
          ...values,
          documentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        showSnackbar('success', 'Share created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchShares();
    } catch (error) {
      showSnackbar('error', 'Failed to save share');
    }
  };

  const handleDelete = async (shareId) => {
    try {
      await deleteDoc(doc(db, 'documentShares', shareId));
      showSnackbar('success', 'Share deleted successfully');
      fetchShares();
    } catch (error) {
      showSnackbar('error', 'Failed to delete share');
    }
  };

  const getPermissionColor = (permission) => {
    switch (permission) {
      case 'view':
        return 'blue';
      case 'edit':
        return 'green';
      case 'admin':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
      }
    },
    {
      title: 'Permission',
      dataIndex: 'permission',
      key: 'permission',
      render: (permission) => (
        <Tag color={getPermissionColor(permission)}>
          {permission.charAt(0).toUpperCase() + permission.slice(1)}
        </Tag>
      )
    },
    {
      title: 'Expires At',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (expiresAt) => (
        <Text type={expiresAt && new Date(expiresAt) < new Date() ? 'danger' : 'secondary'}>
          {expiresAt ? dayjs(expiresAt).format('YYYY-MM-DD') : 'Never'}
        </Text>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (
        <Text type="secondary">
          {dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}
        </Text>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedShare(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this share?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => {
            setSelectedShare(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Share Document
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={shares}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} shares`
        }}
      />

      <Modal
        title={selectedShare ? 'Edit Share' : 'Share Document'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleShare}
          initialValues={{
            permission: 'view',
            expiresAt: null
          }}
        >
          <Form.Item
            name="userId"
            label="User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select
              placeholder="Select a user"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="permission"
            label="Permission"
            rules={[{ required: true, message: 'Please select a permission' }]}
          >
            <Select>
              <Option value="view">View</Option>
              <Option value="edit">Edit</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="expiresAt"
            label="Expiration Date"
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DocumentSharing; 