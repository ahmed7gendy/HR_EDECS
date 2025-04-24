import React, { useState, useEffect } from 'react';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { Table, Tag, Space, Typography, Button, DatePicker, Select, Input, Card, Tooltip } from 'antd';
import { SearchOutlined, FilterOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const DocumentAuditLog = ({ documentId }) => {
  const { showSnackbar } = useSnackbar();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [actionFilter, setActionFilter] = useState(null);
  const [userFilter, setUserFilter] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (documentId) {
      fetchLogs();
      fetchUsers();
    }
  }, [documentId, dateRange, actionFilter, userFilter]);

  const fetchLogs = async () => {
    try {
      let logsQuery = query(
        collection(db, 'documentAuditLogs'),
        where('documentId', '==', documentId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      if (dateRange) {
        logsQuery = query(
          logsQuery,
          where('timestamp', '>=', dateRange[0].toISOString()),
          where('timestamp', '<=', dateRange[1].toISOString())
        );
      }

      if (actionFilter) {
        logsQuery = query(logsQuery, where('action', '==', actionFilter));
      }

      if (userFilter) {
        logsQuery = query(logsQuery, where('userId', '==', userFilter));
      }

      const querySnapshot = await getDocs(logsQuery);
      const logsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
    } catch (error) {
      showSnackbar('error', 'Failed to load audit logs');
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

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'User', 'Details', 'IP Address'],
      ...logs.map(log => [
        dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
        log.action,
        log.userName,
        log.details,
        log.ipAddress
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `document-audit-log-${documentId}-${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return 'green';
      case 'update':
        return 'blue';
      case 'delete':
        return 'red';
      case 'view':
        return 'purple';
      case 'download':
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => (
        <Text type="secondary">
          {dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}
        </Text>
      ),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix()
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action.charAt(0).toUpperCase() + action.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Create', value: 'create' },
        { text: 'Update', value: 'update' },
        { text: 'Delete', value: 'delete' },
        { text: 'View', value: 'view' },
        { text: 'Download', value: 'download' }
      ],
      onFilter: (value, record) => record.action === value
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (userName) => (
        <Space>
          <Text>{userName}</Text>
        </Space>
      )
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details) => (
        <Tooltip title={details}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {details}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ipAddress) => (
        <Text type="secondary">{ipAddress}</Text>
      )
    }
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            showTime
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by action"
            style={{ width: 150 }}
            value={actionFilter}
            onChange={setActionFilter}
            allowClear
          >
            <Select.Option value="create">Create</Select.Option>
            <Select.Option value="update">Update</Select.Option>
            <Select.Option value="delete">Delete</Select.Option>
            <Select.Option value="view">View</Select.Option>
            <Select.Option value="download">Download</Select.Option>
          </Select>
          <Select
            placeholder="Filter by user"
            style={{ width: 200 }}
            value={userFilter}
            onChange={setUserFilter}
            allowClear
          >
            {users.map(user => (
              <Select.Option key={user.id} value={user.id}>
                {user.name}
              </Select.Option>
            ))}
          </Select>
          <Input
            placeholder="Search logs..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={logs.filter(log => 
          !searchText || 
          log.userName.toLowerCase().includes(searchText.toLowerCase()) ||
          log.details.toLowerCase().includes(searchText.toLowerCase())
        )}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} logs`
        }}
      />
    </Card>
  );
};

export default DocumentAuditLog; 