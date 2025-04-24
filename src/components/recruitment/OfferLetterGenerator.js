import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, DatePicker, Space, Modal, Table, message, Divider, Typography } from 'antd';
import { collection, query, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FileTextOutlined, DownloadOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const OfferLetterGenerator = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [offerLetters, setOfferLetters] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    fetchCandidates();
    fetchOfferLetters();
  }, []);

  const fetchCandidates = async () => {
    try {
      const q = query(collection(db, 'candidates'), where('status', '==', 'offer'));
      const querySnapshot = await getDocs(q);
      const candidatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      message.error('Failed to fetch candidates');
    }
  };

  const fetchOfferLetters = async () => {
    try {
      const q = query(collection(db, 'offerLetters'));
      const querySnapshot = await getDocs(q);
      const lettersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOfferLetters(lettersData);
    } catch (error) {
      console.error('Error fetching offer letters:', error);
      message.error('Failed to fetch offer letters');
    }
  };

  const generateOfferLetter = async (values) => {
    try {
      setLoading(true);
      const candidate = candidates.find(c => c.id === values.candidateId);
      
      const letterContent = `
        ${values.companyName}
        ${values.companyAddress}
        
        Date: ${values.offerDate.format('MMMM DD, YYYY')}
        
        Dear ${candidate.name},
        
        We are pleased to offer you the position of ${values.position} at ${values.companyName}. 
        This offer is contingent upon the successful completion of background checks and other pre-employment requirements.
        
        Position Details:
        - Title: ${values.position}
        - Department: ${values.department}
        - Start Date: ${values.startDate.format('MMMM DD, YYYY')}
        - Salary: ${values.salary}
        - Benefits: ${values.benefits}
        
        ${values.additionalTerms}
        
        Please sign and return this letter by ${values.responseDate.format('MMMM DD, YYYY')} to indicate your acceptance of this offer.
        
        Sincerely,
        ${values.hiringManager}
        ${values.companyName}
      `;

      const docRef = await addDoc(collection(db, 'offerLetters'), {
        candidateId: values.candidateId,
        candidateName: candidate.name,
        position: values.position,
        department: values.department,
        salary: values.salary,
        startDate: values.startDate.toDate(),
        offerDate: values.offerDate.toDate(),
        responseDate: values.responseDate.toDate(),
        status: 'pending',
        content: letterContent,
        createdAt: new Date(),
      });

      message.success('Offer letter generated successfully');
      form.resetFields();
      fetchOfferLetters();
    } catch (error) {
      console.error('Error generating offer letter:', error);
      message.error('Failed to generate offer letter');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (letter) => {
    setPreviewContent(letter.content);
    setPreviewVisible(true);
  };

  const handleSend = async (letter) => {
    try {
      await updateDoc(doc(db, 'offerLetters', letter.id), {
        status: 'sent',
        sentAt: new Date(),
      });
      message.success('Offer letter sent successfully');
      fetchOfferLetters();
    } catch (error) {
      console.error('Error sending offer letter:', error);
      message.error('Failed to send offer letter');
    }
  };

  const handleDelete = async (letter) => {
    try {
      await updateDoc(doc(db, 'offerLetters', letter.id), {
        status: 'deleted',
      });
      message.success('Offer letter deleted successfully');
      fetchOfferLetters();
    } catch (error) {
      console.error('Error deleting offer letter:', error);
      message.error('Failed to delete offer letter');
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
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`status-${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => handlePreview(record)}
          />
          <Button
            type="text"
            icon={<SendOutlined />}
            onClick={() => handleSend(record)}
            disabled={record.status === 'sent'}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Offer Letter Generator</Title>
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Generate New Offer Letter
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={offerLetters}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title="Generate Offer Letter"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={generateOfferLetter}
        >
          <Form.Item
            name="candidateId"
            label="Candidate"
            rules={[{ required: true, message: 'Please select a candidate' }]}
          >
            <Select placeholder="Select candidate">
              {candidates.map(candidate => (
                <Option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true, message: 'Please enter the position' }]}
          >
            <Input placeholder="Enter position" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please enter the department' }]}
          >
            <Input placeholder="Enter department" />
          </Form.Item>

          <Form.Item
            name="salary"
            label="Salary"
            rules={[{ required: true, message: 'Please enter the salary' }]}
          >
            <Input placeholder="Enter salary" />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: 'Please select start date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="offerDate"
            label="Offer Date"
            rules={[{ required: true, message: 'Please select offer date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="responseDate"
            label="Response Deadline"
            rules={[{ required: true, message: 'Please select response deadline' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="benefits"
            label="Benefits"
            rules={[{ required: true, message: 'Please enter benefits' }]}
          >
            <TextArea rows={4} placeholder="Enter benefits" />
          </Form.Item>

          <Form.Item
            name="additionalTerms"
            label="Additional Terms"
          >
            <TextArea rows={4} placeholder="Enter additional terms" />
          </Form.Item>

          <Form.Item
            name="companyName"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="Enter company name" />
          </Form.Item>

          <Form.Item
            name="companyAddress"
            label="Company Address"
            rules={[{ required: true, message: 'Please enter company address' }]}
          >
            <TextArea rows={2} placeholder="Enter company address" />
          </Form.Item>

          <Form.Item
            name="hiringManager"
            label="Hiring Manager"
            rules={[{ required: true, message: 'Please enter hiring manager name' }]}
          >
            <Input placeholder="Enter hiring manager name" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Generate Offer Letter
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Offer Letter Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <div className="whitespace-pre-wrap font-mono">
          {previewContent}
        </div>
      </Modal>
    </div>
  );
};

export default OfferLetterGenerator; 