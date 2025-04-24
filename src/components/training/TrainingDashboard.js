import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, DatePicker, Select } from 'antd';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const TrainingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPrograms: 0,
    activePrograms: 0,
    totalParticipants: 0,
    completionRate: 0,
  });
  const [recentTrainings, setRecentTrainings] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [programType, setProgramType] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, programType]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;

      // Fetch training programs
      let programsQuery = query(collection(db, 'trainingPrograms'));
      if (programType !== 'all') {
        programsQuery = query(programsQuery, where('type', '==', programType));
      }
      const programsSnapshot = await getDocs(programsQuery);
      const programs = programsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch training sessions
      const sessionsQuery = query(
        collection(db, 'trainingSessions'),
        where('date', '>=', startDate.toDate()),
        where('date', '<=', endDate.toDate())
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate statistics
      const totalParticipants = sessions.reduce((acc, session) => acc + session.participants.length, 0);
      const completedSessions = sessions.filter(session => session.status === 'completed');
      const completionRate = sessions.length > 0 
        ? (completedSessions.length / sessions.length) * 100 
        : 0;

      setStats({
        totalPrograms: programs.length,
        activePrograms: programs.filter(p => p.status === 'active').length,
        totalParticipants,
        completionRate,
      });

      setRecentTrainings(sessions.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Program',
      dataIndex: 'programName',
      key: 'programName',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Participants',
      dataIndex: 'participants',
      key: 'participants',
      render: (participants) => participants.length,
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
        <h1 className="text-2xl font-bold">Training Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Select
            value={programType}
            onChange={setProgramType}
            className="w-full md:w-48"
          >
            <Option value="all">All Programs</Option>
            <Option value="technical">Technical</Option>
            <Option value="soft-skills">Soft Skills</Option>
            <Option value="compliance">Compliance</Option>
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
              title="Total Programs"
              value={stats.totalPrograms}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Programs"
              value={stats.activePrograms}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Participants"
              value={stats.totalParticipants}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={stats.completionRate}
              suffix="%"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Program Types Distribution" loading={loading}>
            <div className="space-y-4">
              <Progress percent={40} status="active" />
              <Progress percent={30} status="active" />
              <Progress percent={30} status="active" />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Training Effectiveness" loading={loading}>
            <div className="space-y-4">
              <Progress percent={75} status="active" />
              <Progress percent={85} status="active" />
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="Recent Training Sessions"
        className="mt-6"
        loading={loading}
      >
        <Table
          columns={columns}
          dataSource={recentTrainings}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default TrainingDashboard; 