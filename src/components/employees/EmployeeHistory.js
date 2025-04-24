import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Tag, Typography, message, Tabs, Tooltip, Timeline } from 'antd';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { SearchOutlined, FilterOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const EmployeeHistory = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'timeline'
  const [filters, setFilters] = useState({
    dateRange: [dayjs().subtract(30, 'days'), dayjs()],
    employee: null,
    eventType: null,
  });

  useEffect(() => {
    fetchHistory();
    fetchEmployees();
  }, [filters]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      let q = query(collection(db, 'employeeHistory'), orderBy('timestamp', 'desc'));

      if (filters.dateRange) {
        q = query(q, where('timestamp', '>=', filters.dateRange[0].toDate()));
        q = query(q, where('timestamp', '<=', filters.dateRange[1].toDate()));
      }

      if (filters.employee) {
        q = query(q, where('employeeId', '==', filters.employee));
      }

      if (filters.eventType) {
        q = query(q, where('type', '==', filters.eventType));
      }

      const querySnapshot = await getDocs(q);
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching history:', error);
      message.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const q = query(collection(db, 'employees'));
      const querySnapshot = await getDocs(q);
      const employeesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  const handleExport = () => {
    // Implement export functionality
    message.success('Exporting history...');
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'hire': return 'green';
      case 'promotion': return 'blue';
      case 'transfer': return 'orange';
      case 'termination': return 'red';
      case 'leave': return 'purple';
      default: return 'default';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'hire': return '👋';
      case 'promotion': return '📈';
      case 'transfer': return '🔄';
      case 'termination': return '🚪';
      case 'leave': return '🌴';
      default: return '📝';
    }
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text, record) => (
        <Space>
          <Avatar src={record.employeeAvatar} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Event Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Space>
          <span>{getEventIcon(type)}</span>
          <Tag color={getEventColor(type)}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => dayjs(date).format('MMM DD, YYYY HH:mm'),
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

  const timelineItems = history.map(event => ({
    color: getEventColor(event.type),
    children: (
      <div>
        <div className="flex justify-between items-center">
          <Space>
            <span>{getEventIcon(event.type)}</span>
            <Tag color={getEventColor(event.type)}>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </Tag>
          </Space>
          <Text type="secondary">
            {dayjs(event.timestamp).format('MMM DD, YYYY HH:mm')}
          </Text>
        </div>
        <div className="mt-2">
          <Text strong>{event.employeeName}</Text>
          <p>{event.description}</p>
        </div>
      </div>
    ),
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Employee History</Title>
        <Space>
          <Button
            type={viewMode === 'table' ? 'primary' : 'default'}
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button
            type={viewMode === 'timeline' ? 'primary' : 'default'}
            onClick={() => setViewMode('timeline')}
          >
            Timeline View
          </Button>
        </Space>
      </div>

      <Card>
        <div className="mb-4">
          <Space>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
            <Select
              style={{ width: 200 }}
              placeholder="Filter by employee"
              value={filters.employee}
              onChange={(value) => setFilters({ ...filters, employee: value })}
              allowClear
            >
              {employees.map(employee => (
                <Option key={employee.id} value={employee.id}>
                  {employee.name}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: 200 }}
              placeholder="Filter by event type"
              value={filters.eventType}
              onChange={(value) => setFilters({ ...filters, eventType: value })}
              allowClear
            >
              <Option value="hire">Hire</Option>
              <Option value="promotion">Promotion</Option>
              <Option value="transfer">Transfer</Option>
              <Option value="termination">Termination</Option>
              <Option value="leave">Leave</Option>
            </Select>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Space>
        </div>

        {viewMode === 'table' ? (
          <Table
            columns={columns}
            dataSource={history}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} events`,
            }}
          />
        ) : (
          <Timeline items={timelineItems} />
        )}
      </Card>

      <Modal
        title="Event Details"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedEvent(null);
        }}
        footer={null}
        width={800}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <Text strong>Employee Information</Text>
              <p>Name: {selectedEvent.employeeName}</p>
              <p>Event Type: {selectedEvent.type}</p>
              <p>Date: {dayjs(selectedEvent.timestamp).format('MMM DD, YYYY HH:mm')}</p>
            </div>
            <div>
              <Text strong>Event Details</Text>
              <p>{selectedEvent.description}</p>
            </div>
            {selectedEvent.changes && (
              <div>
                <Text strong>Changes Made</Text>
                <pre className="bg-gray-50 p-4 rounded">
                  {JSON.stringify(selectedEvent.changes, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeHistory; 