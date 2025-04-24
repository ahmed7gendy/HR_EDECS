import React, { useState, useEffect } from 'react';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Table, Tag, Space, Typography, Button, Modal, Form, Input, Tooltip, Popconfirm } from 'antd';
import { HistoryOutlined, RollbackOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const DocumentVersionControl = ({ documentId }) => {
  const { showSnackbar } = useSnackbar();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (documentId) {
      fetchVersions();
    }
  }, [documentId]);

  const fetchVersions = async () => {
    try {
      const versionsQuery = query(
        collection(db, 'documentVersions'),
        where('documentId', '==', documentId),
        where('isDeleted', '==', false)
      );
      const querySnapshot = await getDocs(versionsQuery);
      const versionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVersions(versionsData.sort((a, b) => b.version - a.version));
    } catch (error) {
      showSnackbar('error', 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async (values) => {
    try {
      const currentVersion = versions[0]?.version || 0;
      await addDoc(collection(db, 'documentVersions'), {
        documentId,
        version: currentVersion + 1,
        description: values.description,
        createdBy: 'currentUserId', // Replace with actual current user ID
        createdAt: new Date().toISOString(),
        isDeleted: false
      });
      showSnackbar('success', 'Version created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchVersions();
    } catch (error) {
      showSnackbar('error', 'Failed to create version');
    }
  };

  const handleRestoreVersion = async (versionId) => {
    try {
      await updateDoc(doc(db, 'documentVersions', versionId), {
        restoredAt: new Date().toISOString(),
        restoredBy: 'currentUserId' // Replace with actual current user ID
      });
      showSnackbar('success', 'Version restored successfully');
      fetchVersions();
    } catch (error) {
      showSnackbar('error', 'Failed to restore version');
    }
  };

  const handleDeleteVersion = async (versionId) => {
    try {
      await updateDoc(doc(db, 'documentVersions', versionId), {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: 'currentUserId' // Replace with actual current user ID
      });
      showSnackbar('success', 'Version deleted successfully');
      fetchVersions();
    } catch (error) {
      showSnackbar('error', 'Failed to delete version');
    }
  };

  const handleDownloadVersion = async (versionId) => {
    try {
      // Implement download logic here
      showSnackbar('success', 'Version downloaded successfully');
    } catch (error) {
      showSnackbar('error', 'Failed to download version');
    }
  };

  const columns = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version) => (
        <Tag color={version === versions[0]?.version ? 'green' : 'default'}>
          v{version}
        </Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description) => <Text>{description}</Text>
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy) => <Text>{createdBy}</Text>
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
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.restoredAt) {
          return <Tag color="orange">Restored</Tag>;
        }
        if (record.isDeleted) {
          return <Tag color="red">Deleted</Tag>;
        }
        return <Tag color="green">Active</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {!record.isDeleted && (
            <>
              <Tooltip title="Download">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadVersion(record.id)}
                />
              </Tooltip>
              {record.version !== versions[0]?.version && (
                <Tooltip title="Restore">
                  <Button
                    type="text"
                    icon={<RollbackOutlined />}
                    onClick={() => handleRestoreVersion(record.id)}
                  />
                </Tooltip>
              )}
              <Popconfirm
                title="Are you sure you want to delete this version?"
                onConfirm={() => handleDeleteVersion(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </>
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
          icon={<HistoryOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Create New Version
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={versions}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} versions`
        }}
      />

      <Modal
        title="Create New Version"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateVersion}
        >
          <Form.Item
            name="description"
            label="Version Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea rows={4} placeholder="Describe the changes in this version" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Version
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentVersionControl; 