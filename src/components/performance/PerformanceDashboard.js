import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, DatePicker, Select, Tag } from 'antd';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PerformanceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    goalsCompleted: 0,
    performanceTrend: 0,
  });
  const [recentReviews, setRecentReviews] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [department, setDepartment] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, department]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;

      // Fetch performance reviews
      let reviewsQuery = query(collection(db, 'performanceReviews'));
      if (department !== 'all') {
        reviewsQuery = query(reviewsQuery, where('department', '==', department));
      }
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch performance goals
      const goalsQuery = query(
        collection(db, 'performanceGoals'),
        where('targetDate', '>=', startDate.toDate()),
        where('targetDate', '<=', endDate.toDate())
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const goals = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate statistics
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
        : 0;
      const completedGoals = goals.filter(goal => goal.status === 'completed').length;
      const performanceTrend = totalReviews > 0
        ? (reviews.filter(review => review.rating >= 4).length / totalReviews) * 100
        : 0;

      setStats({
        averageRating,
        totalReviews,
        goalsCompleted: completedGoals,
        performanceTrend,
      });

      setRecentReviews(reviews.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Tag color={rating >= 4 ? 'green' : rating >= 3 ? 'blue' : 'red'}>
          {rating}/5
        </Tag>
      ),
    },
    {
      title: 'Review Date',
      dataIndex: 'reviewDate',
      key: 'reviewDate',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Performance Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Select
            value={department}
            onChange={setDepartment}
            className="w-full md:w-48"
          >
            <Option value="all">All Departments</Option>
            <Option value="engineering">Engineering</Option>
            <Option value="marketing">Marketing</Option>
            <Option value="sales">Sales</Option>
            <Option value="hr">Human Resources</Option>
          </Select>
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
              title="Average Rating"
              value={stats.averageRating}
              precision={1}
              suffix="/5"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Reviews"
              value={stats.totalReviews}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Goals Completed"
              value={stats.goalsCompleted}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Performance Trend"
              value={stats.performanceTrend}
              suffix="%"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Department Performance" loading={loading}>
            <div className="space-y-4">
              <Progress percent={85} status="active" />
              <Progress percent={75} status="active" />
              <Progress percent={65} status="active" />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Goal Completion Rate" loading={loading}>
            <div className="space-y-4">
              <Progress percent={90} status="active" />
              <Progress percent={80} status="active" />
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="Recent Performance Reviews"
        className="mt-6"
        loading={loading}
      >
        <Table
          columns={columns}
          dataSource={recentReviews}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default PerformanceDashboard; 