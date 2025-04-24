import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, DatePicker, Select } from 'antd';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const RecruitmentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    hiredCandidates: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [jobStatus, setJobStatus] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, jobStatus]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;

      // Fetch job statistics
      let jobsQuery = query(collection(db, 'jobs'));
      if (jobStatus !== 'all') {
        jobsQuery = query(jobsQuery, where('status', '==', jobStatus));
      }
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch application statistics
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('appliedDate', '>=', startDate.toDate()),
        where('appliedDate', '<=', endDate.toDate())
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'active').length,
        totalApplications: applications.length,
        hiredCandidates: applications.filter(a => a.status === 'hired').length,
      };

      setStats(stats);
      setRecentApplications(applications.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Candidate',
      dataIndex: 'candidateName',
      key: 'candidateName',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Applied Date',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`status-${status.toLowerCase()}`}>
          {status}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Recruitment Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Select
            value={jobStatus}
            onChange={setJobStatus}
            className="w-full md:w-48"
          >
            <Option value="all">All Jobs</Option>
            <Option value="active">Active Jobs</Option>
            <Option value="closed">Closed Jobs</Option>
            <Option value="draft">Draft Jobs</Option>
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
              title="Total Jobs"
              value={stats.totalJobs}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Jobs"
              value={stats.activeJobs}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={stats.totalApplications}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Hired Candidates"
              value={stats.hiredCandidates}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Application Status" loading={loading}>
            <div className="space-y-4">
              <Progress percent={70} status="active" />
              <Progress percent={50} status="active" />
              <Progress percent={30} status="active" />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Source of Applications" loading={loading}>
            <div className="space-y-4">
              <Progress percent={60} status="active" />
              <Progress percent={40} status="active" />
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="Recent Applications"
        className="mt-6"
        loading={loading}
      >
        <Table
          columns={columns}
          dataSource={recentApplications}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default RecruitmentDashboard; 