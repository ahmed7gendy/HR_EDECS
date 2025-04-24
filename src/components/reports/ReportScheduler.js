import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Tag, Space, message, Switch, TimePicker, Tooltip } from 'antd';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const ReportScheduler = () => {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchSchedules();
    fetchReports();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'reportSchedules'));
      const querySnapshot = await getDocs(q);
      const schedulesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      message.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const q = query(collection(db, 'customReports'));
      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      message.error('Failed to fetch reports');
    }
  };

  const handleAddSchedule = async (values) => {
    try {
      setLoading(true);
      const scheduleData = {
        ...values,
        isActive: true,
        lastRun: null,
        nextRun: calculateNextRun(values),
        createdAt: new Date().toISOString(),
        createdBy: 'currentUser', // Replace with actual user
      };

      await addDoc(collection(db, 'reportSchedules'), scheduleData);
      message.success('Schedule created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      message.error('Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (values) => {
    try {
      setLoading(true);
      const scheduleRef = doc(db, 'reportSchedules', selectedSchedule.id);
      await updateDoc(scheduleRef, {
        ...values,
        nextRun: calculateNextRun(values),
        updatedAt: new Date().toISOString(),
      });
      message.success('Schedule updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setSelectedSchedule(null);
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      message.error('Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (schedule) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'reportSchedules', schedule.id));
      message.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      message.error('Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (schedule) => {
    try {
      setLoading(true);
      const scheduleRef = doc(db, 'reportSchedules', schedule.id);
      await updateDoc(scheduleRef, {
        isActive: !schedule.isActive,
        updatedAt: new Date().toISOString(),
      });
      message.success(`Schedule ${!schedule.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchSchedules();
    } catch (error) {
      console.error('Error toggling schedule:', error);
      message.error('Failed to toggle schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    form.setFieldsValue({
      reportId: schedule.reportId,
      frequency: schedule.frequency,
      time: dayjs(schedule.time, 'HH:mm'),
      recipients: schedule.recipients,
      format: schedule.format,
    });
    setIsModalVisible(true);
  };

  const calculateNextRun = (values) => {
    const now = dayjs();
    const scheduledTime = dayjs(values.time, 'HH:mm');
    let nextRun = now;

    switch (values.frequency) {
      case 'daily':
        nextRun = now.hour(scheduledTime.hour()).minute(scheduledTime.minute());
        if (nextRun.isBefore(now)) {
          nextRun = nextRun.add(1, 'day');
        }
        break;
      case 'weekly':
        nextRun = now.day(1).hour(scheduledTime.hour()).minute(scheduledTime.minute());
        if (nextRun.isBefore(now)) {
          nextRun = nextRun.add(1, 'week');
        }
        break;
      case 'monthly':
        nextRun = now.date(1).hour(scheduledTime.hour()).minute(scheduledTime.minute());
        if (nextRun.isBefore(now)) {
          nextRun = nextRun.add(1, 'month');
        }
        break;
      default:
        break;
    }

    return nextRun.toISOString();
  };

  const getScheduleColumns = () => {
    return [
      {
        title: 'Report',
        dataIndex: 'reportId',
        key: 'report',
        render: (reportId) => {
          const report = reports.find(r => r.id === reportId);
          return report ? report.name : 'Unknown Report';
        },
      },
      {
        title: 'Frequency',
        dataIndex: 'frequency',
        key: 'frequency',
        render: (frequency) => (
          <Tag color={frequency === 'daily' ? 'blue' : frequency === 'weekly' ? 'green' : 'orange'}>
            {frequency}
          </Tag>
        ),
      },
      {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
        render: (time) => dayjs(time, 'HH:mm').format('hh:mm A'),
      },
      {
        title: 'Next Run',
        dataIndex: 'nextRun',
        key: 'nextRun',
        render: (date) => date ? dayjs(date).format('MMM DD, YYYY hh:mm A') : 'Not scheduled',
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'status',
        render: (isActive) => (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Tooltip title={record.isActive ? 'Pause Schedule' : 'Activate Schedule'}>
              <Button
                type="text"
                icon={record.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => handleToggleActive(record)}
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
                onClick={() => handleDeleteSchedule(record)}
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
        <h1 className="text-2xl font-bold">Report Scheduler</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedSchedule(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Create Schedule
        </Button>
      </div>

      <Table
        columns={getScheduleColumns()}
        dataSource={schedules}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={selectedSchedule ? 'Edit Schedule' : 'Create Schedule'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedSchedule(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedSchedule ? handleUpdateSchedule : handleAddSchedule}
        >
          <Form.Item
            name="reportId"
            label="Report"
            rules={[{ required: true, message: 'Please select a report' }]}
          >
            <Select>
              {reports.map(report => (
                <Option key={report.id} value={report.id}>
                  {report.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="frequency"
            label="Frequency"
            rules={[{ required: true, message: 'Please select frequency' }]}
          >
            <Select>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: 'Please select time' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="recipients"
            label="Recipients"
            rules={[{ required: true, message: 'Please enter recipients' }]}
          >
            <Select mode="tags" placeholder="Enter email addresses">
              <Option value="admin@example.com">Admin</Option>
              <Option value="manager@example.com">Manager</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="format"
            label="Format"
            rules={[{ required: true, message: 'Please select format' }]}
          >
            <Select>
              <Option value="pdf">PDF</Option>
              <Option value="excel">Excel</Option>
              <Option value="csv">CSV</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setSelectedSchedule(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedSchedule ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportScheduler; 