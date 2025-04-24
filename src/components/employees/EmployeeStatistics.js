import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Select, DatePicker, Typography, Space, Progress } from 'antd';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, TeamOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const EmployeeStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0,
    turnoverRate: 0,
    averageTenure: 0,
    departmentDistribution: [],
    genderDistribution: [],
    ageDistribution: [],
  });
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, [dateRange, department]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      let q = query(collection(db, 'employees'));

      if (department) {
        q = query(q, where('department', '==', department));
      }

      const querySnapshot = await getDocs(q);
      const employees = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate statistics
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(e => e.status === 'active').length;
      const newHires = employees.filter(e => 
        dayjs(e.hireDate).isAfter(dateRange[0]) && 
        dayjs(e.hireDate).isBefore(dateRange[1])
      ).length;
      
      const turnoverRate = ((totalEmployees - activeEmployees) / totalEmployees) * 100;
      
      const averageTenure = employees.reduce((acc, curr) => {
        const tenure = dayjs().diff(dayjs(curr.hireDate), 'year', true);
        return acc + tenure;
      }, 0) / totalEmployees;

      // Department distribution
      const departmentCount = employees.reduce((acc, curr) => {
        acc[curr.department] = (acc[curr.department] || 0) + 1;
        return acc;
      }, {});
      const departmentDistribution = Object.entries(departmentCount).map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalEmployees) * 100,
      }));

      // Gender distribution
      const genderCount = employees.reduce((acc, curr) => {
        acc[curr.gender] = (acc[curr.gender] || 0) + 1;
        return acc;
      }, {});
      const genderDistribution = Object.entries(genderCount).map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalEmployees) * 100,
      }));

      // Age distribution
      const ageGroups = {
        '18-24': 0,
        '25-34': 0,
        '35-44': 0,
        '45-54': 0,
        '55+': 0,
      };
      employees.forEach(employee => {
        const age = dayjs().diff(dayjs(employee.birthDate), 'year');
        if (age >= 18 && age <= 24) ageGroups['18-24']++;
        else if (age >= 25 && age <= 34) ageGroups['25-34']++;
        else if (age >= 35 && age <= 44) ageGroups['35-44']++;
        else if (age >= 45 && age <= 54) ageGroups['45-54']++;
        else ageGroups['55+']++;
      });
      const ageDistribution = Object.entries(ageGroups).map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalEmployees) * 100,
      }));

      setStats({
        totalEmployees,
        activeEmployees,
        newHires,
        turnoverRate,
        averageTenure,
        departmentDistribution,
        genderDistribution,
        ageDistribution,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => (
        <Progress percent={percentage} size="small" />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Employee Statistics</Title>
        <Space>
          <Select
            style={{ width: 200 }}
            placeholder="Filter by department"
            value={department}
            onChange={setDepartment}
            allowClear
          >
            <Option value="HR">Human Resources</Option>
            <Option value="IT">Information Technology</Option>
            <Option value="Finance">Finance</Option>
            <Option value="Marketing">Marketing</Option>
            <Option value="Sales">Sales</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Employees"
              value={stats.totalEmployees}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Active Employees"
              value={stats.activeEmployees}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="New Hires"
              value={stats.newHires}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Turnover Rate"
              value={stats.turnoverRate}
              precision={2}
              suffix="%"
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} md={12}>
          <Card title="Department Distribution" loading={loading}>
            <Table
              columns={columns}
              dataSource={stats.departmentDistribution}
              rowKey="name"
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Gender Distribution" loading={loading}>
            <Table
              columns={columns}
              dataSource={stats.genderDistribution}
              rowKey="name"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          <Card title="Age Distribution" loading={loading}>
            <Table
              columns={columns}
              dataSource={stats.ageDistribution}
              rowKey="name"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} md={12}>
          <Card title="Average Tenure" loading={loading}>
            <Statistic
              value={stats.averageTenure}
              precision={1}
              suffix="years"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Employee Status" loading={loading}>
            <Progress
              percent={(stats.activeEmployees / stats.totalEmployees) * 100}
              success={{ percent: (stats.newHires / stats.totalEmployees) * 100 }}
              format={() => (
                <Space>
                  <Text>Active: {stats.activeEmployees}</Text>
                  <Text type="success">New: {stats.newHires}</Text>
                </Space>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeStatistics; 