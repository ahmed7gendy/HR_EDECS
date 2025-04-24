import React, { useState, useEffect } from 'react';
import { Card, Table, Select, DatePicker, Button, Space, Tag, Tooltip, Typography, Input, Badge } from 'antd';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { SearchOutlined, FilterOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;

const UserActivityLog = () => {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'days'), dayjs()]);
  const [userFilter, setUserFilter] = useState(null);
  const [actionFilter, setActionFilter] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchActivities();
    fetchUsers();
  }, [dateRange, userFilter, actionFilter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let q = query(collection(db, 'userActivities'), orderBy('timestamp', 'desc'));

      if (dateRange) {
        q = query(q, where('timestamp', '>=', dateRange[0].toDate()));
        q = query(q, where('timestamp', '<=', dateRange[1].toDate()));
      }

      if (userFilter) {
        q = query(q, where('userId', '==', userFilter));
      }

      if (actionFilter) {
        q = query(q, where('action', '==', actionFilter));
      }

      const querySnapshot = await getDocs(q);
      const activitiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setIsModalVisible(true);
  };

  const handleExport = () => {
    // Implement export functionality
    message.success('Exporting activities...');
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'login': return 'green';
      case 'logout': return 'red';
      case 'create': return 'blue';
      case 'update': return 'orange';
      case 'delete': return 'red';
      case 'view': return 'purple';
      default: return 'default';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'login': return '🔑';
      case 'logout': return '🚪';
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'view': return '👁️';
      default: return '📝';
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <Space>
          <Badge status="success" />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Space>
          <span>{getActionIcon(action)}</span>
          <Tag color={getActionColor(action)}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: (module) => (
        <Tag color="blue">{module}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => dayjs(date).format('MMM DD, YYYY HH:mm:ss'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         activity.userName.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>User Activity Log</Title>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Filter by user"
            value={userFilter}
            onChange={setUserFilter}
            allowClear
          >
            {users.map(user => (
              <Option key={user.id} value={user.id}>
                {user.name}
              </Option>
            ))}
          </Select>
          <Select
            style={{ width: 200 }}
            placeholder="Filter by action"
            value={actionFilter}
            onChange={setActionFilter}
            allowClear
          >
            <Option value="login">Login</Option>
            <Option value="logout">Logout</Option>
            <Option value="create">Create</Option>
            <Option value="update">Update</Option>
            <Option value="delete">Delete</Option>
            <Option value="view">View</Option>
          </Select>
          <Search
            placeholder="Search activities"
            allowClear
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

      <Card>
        <Table
          columns={columns}
          dataSource={filteredActivities}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} activities`,
          }}
        />
      </Card>

      <Modal
        title="Activity Details"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedActivity(null);
        }}
        footer={null}
        width={800}
      >
        {selectedActivity && (
          <div className="space-y-4">
            <div>
              <Text strong>User Information</Text>
              <p>Name: {selectedActivity.userName}</p>
              <p>Action: {selectedActivity.action}</p>
              <p>Module: {selectedActivity.module}</p>
              <p>Timestamp: {dayjs(selectedActivity.timestamp).format('MMM DD, YYYY HH:mm:ss')}</p>
            </div>
            <div>
              <Text strong>Activity Details</Text>
              <p>{selectedActivity.description}</p>
            </div>
            <div>
              <Text strong>Technical Information</Text>
              <p>IP Address: {selectedActivity.ipAddress}</p>
              <p>User Agent: {selectedActivity.userAgent}</p>
            </div>
            {selectedActivity.changes && (
              <div>
                <Text strong>Changes Made</Text>
                <pre className="bg-gray-50 p-4 rounded">
                  {JSON.stringify(selectedActivity.changes, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserActivityLog; 