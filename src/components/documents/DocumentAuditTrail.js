import React, { useState, useEffect } from 'react';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Table, Tag, Space, Typography, Select, DatePicker, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const DocumentAuditTrail = ({ documentId }) => {
  const { showSnackbar } = useSnackbar();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    if (documentId) {
      fetchAuditLogs();
    }
  }, [documentId, dateRange, actionFilter]);

  const fetchAuditLogs = async () => {
    try {
      let auditQuery = query(
        collection(db, 'documentAuditLogs'),
        where('documentId', '==', documentId),
        orderBy('timestamp', 'desc')
      );

      if (dateRange) {
        auditQuery = query(
          auditQuery,
          where('timestamp', '>=', dateRange[0].toISOString()),
          where('timestamp', '<=', dateRange[1].toISOString())
        );
      }

      if (actionFilter !== 'all') {
        auditQuery = query(auditQuery, where('action', '==', actionFilter));
      }

      const querySnapshot = await getDocs(auditQuery);
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAuditLogs(logs);
    } catch (error) {
      showSnackbar('error', 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'view':
        return 'blue';
      case 'edit':
        return 'orange';
      case 'delete':
        return 'red';
      case 'share':
        return 'green';
      case 'download':
        return 'purple';
      default:
        return 'default';
    }
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      auditLogs.map(log => ({
        'User': log.userName,
        'Action': log.action,
        'Details': log.details,
        'Timestamp': dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
        'IP Address': log.ipAddress
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Logs');
    XLSX.writeFile(workbook, `document_audit_logs_${documentId}.xlsx`);
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action.charAt(0).toUpperCase() + action.slice(1)}
        </Tag>
      )
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (text) => <Text type="secondary">{text}</Text>
    },
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
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (text) => <Text code>{text}</Text>
    }
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          onChange={(dates) => setDateRange(dates)}
          showTime
        />
        <Select
          value={actionFilter}
          onChange={setActionFilter}
          style={{ width: 120 }}
        >
          <Select.Option value="all">All Actions</Select.Option>
          <Select.Option value="view">View</Select.Option>
          <Select.Option value="edit">Edit</Select.Option>
          <Select.Option value="delete">Delete</Select.Option>
          <Select.Option value="share">Share</Select.Option>
          <Select.Option value="download">Download</Select.Option>
        </Select>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          Export
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={auditLogs}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`
        }}
      />
    </div>
  );
};

export default DocumentAuditTrail; 