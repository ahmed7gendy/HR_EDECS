import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Select, DatePicker, Button, Space, Progress, Tooltip, Divider } from 'antd';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DownloadOutlined, FilterOutlined, TeamOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const RecruitmentMetrics = () => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchDepartments();
  }, [dateRange, departmentFilter]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      let q = query(collection(db, 'candidates'), orderBy('applicationDate', 'desc'));

      if (dateRange) {
        q = query(q, where('applicationDate', '>=', dateRange[0].toDate()));
        q = query(q, where('applicationDate', '<=', dateRange[1].toDate()));
      }

      if (departmentFilter) {
        q = query(q, where('department', '==', departmentFilter));
      }

      const querySnapshot = await getDocs(q);
      const candidates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate metrics
      const totalApplications = candidates.length;
      const hiredCandidates = candidates.filter(c => c.status === 'hired').length;
      const rejectedCandidates = candidates.filter(c => c.status === 'rejected').length;
      const inProcessCandidates = candidates.filter(c => ['interview', 'assessment', 'offer'].includes(c.status)).length;
      
      const averageTimeToHire = calculateAverageTimeToHire(candidates);
      const sourceDistribution = calculateSourceDistribution(candidates);
      const departmentDistribution = calculateDepartmentDistribution(candidates);
      const statusDistribution = calculateStatusDistribution(candidates);

      setMetrics({
        totalApplications,
        hiredCandidates,
        rejectedCandidates,
        inProcessCandidates,
        averageTimeToHire,
        sourceDistribution,
        departmentDistribution,
        statusDistribution,
        candidates,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const q = query(collection(db, 'departments'));
      const querySnapshot = await getDocs(q);
      const departmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const calculateAverageTimeToHire = (candidates) => {
    const hiredCandidates = candidates.filter(c => c.status === 'hired');
    if (hiredCandidates.length === 0) return 0;

    const totalDays = hiredCandidates.reduce((sum, candidate) => {
      const applicationDate = dayjs(candidate.applicationDate);
      const hireDate = dayjs(candidate.hireDate);
      return sum + hireDate.diff(applicationDate, 'days');
    }, 0);

    return Math.round(totalDays / hiredCandidates.length);
  };

  const calculateSourceDistribution = (candidates) => {
    const sources = {};
    candidates.forEach(candidate => {
      sources[candidate.source] = (sources[candidate.source] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  };

  const calculateDepartmentDistribution = (candidates) => {
    const departments = {};
    candidates.forEach(candidate => {
      departments[candidate.department] = (departments[candidate.department] || 0) + 1;
    });
    return Object.entries(departments).map(([name, value]) => ({ name, value }));
  };

  const calculateStatusDistribution = (candidates) => {
    const statuses = {};
    candidates.forEach(candidate => {
      statuses[candidate.status] = (statuses[candidate.status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'hired': return '#52c41a';
      case 'rejected': return '#f5222d';
      case 'interview': return '#1890ff';
      case 'assessment': return '#faad14';
      case 'offer': return '#722ed1';
      default: return '#d9d9d9';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recruitment Metrics</h1>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Filter by department"
            value={departmentFilter}
            onChange={setDepartmentFilter}
            allowClear
          >
            {departments.map(dept => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {/* Implement export */}}
          >
            Export
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={metrics.totalApplications}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hired Candidates"
              value={metrics.hiredCandidates}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rejected Candidates"
              value={metrics.rejectedCandidates}
              valueStyle={{ color: '#f5222d' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Time to Hire"
              value={metrics.averageTimeToHire}
              suffix="days"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col span={12}>
          <Card title="Application Sources">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.sourceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.sourceDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Department Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="Candidate Status">
        <div className="space-y-4">
          {metrics.statusDistribution?.map(status => (
            <div key={status.name}>
              <div className="flex justify-between mb-2">
                <span>{status.name}</span>
                <span>{status.value}</span>
              </div>
              <Progress
                percent={(status.value / metrics.totalApplications) * 100}
                strokeColor={getStatusColor(status.name)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recent Applications" className="mt-6">
        <Table
          dataSource={metrics.candidates?.slice(0, 5)}
          columns={[
            {
              title: 'Candidate',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: 'Department',
              dataIndex: 'department',
              key: 'department',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <Tag color={getStatusColor(status)}>
                  {status}
                </Tag>
              ),
            },
            {
              title: 'Application Date',
              dataIndex: 'applicationDate',
              key: 'applicationDate',
              render: (date) => dayjs(date).format('MMM DD, YYYY'),
            },
          ]}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default RecruitmentMetrics; 