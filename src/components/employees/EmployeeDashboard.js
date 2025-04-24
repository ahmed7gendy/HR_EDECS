import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, DatePicker } from 'antd';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    newHires: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;

      // Fetch employee statistics
      const employeesQuery = query(collection(db, 'employees'));
      const employeesSnapshot = await getDocs(employeesQuery);
      const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const stats = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === 'active').length,
        onLeave: employees.filter(e => e.onLeave).length,
        newHires: employees.filter(e => 
          dayjs(e.hireDate).isBetween(startDate, endDate, 'day', '[]')
        ).length,
      };

      // Fetch recent activities
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('date', '>=', startDate.toDate()),
        where('date', '<=', endDate.toDate())
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activities = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setStats(stats);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Activity',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Employee Dashboard</h1>
        <div className="mt-4">
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-full md:w-auto"
          />
        </div>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={stats.totalEmployees}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Employees"
              value={stats.activeEmployees}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="On Leave"
              value={stats.onLeave}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="New Hires"
              value={stats.newHires}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Department Distribution" loading={loading}>
            <div className="space-y-4">
              {/* Department distribution chart will be implemented here */}
              <Progress percent={70} status="active" />
              <Progress percent={50} status="active" />
              <Progress percent={30} status="active" />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Gender Distribution" loading={loading}>
            <div className="space-y-4">
              {/* Gender distribution chart will be implemented here */}
              <Progress percent={60} status="active" />
              <Progress percent={40} status="active" />
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="Recent Activities"
        className="mt-6"
        loading={loading}
      >
        <Table
          columns={columns}
          dataSource={recentActivities}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default EmployeeDashboard; 