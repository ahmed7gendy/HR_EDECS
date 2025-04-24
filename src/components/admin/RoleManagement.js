import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Tag, Space, message, Tabs, Tooltip, Divider, Switch, Tree } from 'antd';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const RoleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const q = query(collection(db, 'permissions'));
      const querySnapshot = await getDocs(q);
      const permissionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      message.error('Failed to fetch permissions');
    }
  };

  const handleAddRole = async (values) => {
    try {
      setLoading(true);
      const roleData = {
        ...values,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'currentUser', // Replace with actual user
        lastModified: new Date().toISOString(),
      };

      await addDoc(collection(db, 'roles'), roleData);
      message.success('Role created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      message.error('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (values) => {
    try {
      setLoading(true);
      const roleRef = doc(db, 'roles', selectedRole.id);
      await updateDoc(roleRef, {
        ...values,
        lastModified: new Date().toISOString(),
      });
      message.success('Role updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setSelectedRole(null);
      fetchRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      message.error('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (role) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'roles', role.id));
      message.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      message.error('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (role) => {
    try {
      setLoading(true);
      const roleRef = doc(db, 'roles', role.id);
      await updateDoc(roleRef, {
        isActive: !role.isActive,
        lastModified: new Date().toISOString(),
      });
      message.success(`Role ${!role.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchRoles();
    } catch (error) {
      console.error('Error toggling role:', error);
      message.error('Failed to toggle role');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
    });
    setIsModalVisible(true);
  };

  const getRoleColumns = () => {
    return [
      {
        title: 'Role Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Permissions',
        dataIndex: 'permissions',
        key: 'permissions',
        render: (permissions) => (
          <Space wrap>
            {permissions?.map(permission => (
              <Tag key={permission} color="blue">{permission}</Tag>
            ))}
          </Space>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'status',
        render: (isActive) => (
          <Switch
            checked={isActive}
            onChange={() => handleToggleActive(selectedRole)}
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
                onClick={() => handleDeleteRole(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ];
  };

  const getPermissionTreeData = () => {
    return [
      {
        title: 'Employee Management',
        key: 'employee',
        children: [
          { title: 'View Employees', key: 'employee:view' },
          { title: 'Add Employees', key: 'employee:add' },
          { title: 'Edit Employees', key: 'employee:edit' },
          { title: 'Delete Employees', key: 'employee:delete' },
        ],
      },
      {
        title: 'Project Management',
        key: 'project',
        children: [
          { title: 'View Projects', key: 'project:view' },
          { title: 'Add Projects', key: 'project:add' },
          { title: 'Edit Projects', key: 'project:edit' },
          { title: 'Delete Projects', key: 'project:delete' },
        ],
      },
      {
        title: 'Document Management',
        key: 'document',
        children: [
          { title: 'View Documents', key: 'document:view' },
          { title: 'Upload Documents', key: 'document:upload' },
          { title: 'Edit Documents', key: 'document:edit' },
          { title: 'Delete Documents', key: 'document:delete' },
        ],
      },
    ];
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedRole(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Create Role
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="All Roles" key="all">
          <Table
            columns={getRoleColumns()}
            dataSource={roles}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        <TabPane tab="Active Roles" key="active">
          <Table
            columns={getRoleColumns()}
            dataSource={roles.filter(r => r.isActive)}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={selectedRole ? 'Edit Role' : 'Create Role'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedRole(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedRole ? handleUpdateRole : handleAddRole}
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: 'Please select permissions' }]}
          >
            <Tree
              checkable
              treeData={getPermissionTreeData()}
              defaultExpandAll
            />
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
                setSelectedRole(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedRole ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagement; 