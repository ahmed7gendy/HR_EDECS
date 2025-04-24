import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Tag, Space, message, Steps, Timeline, Comment, Avatar, Tooltip } from 'antd';
import { collection, query, getDocs, addDoc, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, UserOutlined, CommentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const DocumentApproval = () => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const [approvalStatus, setApprovalStatus] = useState('pending');
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'documents'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const documentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching documents:', error);
      message.error('Failed to fetch documents');
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
      message.error('Failed to fetch employees');
    }
  };

  const handleSubmitForApproval = async (values) => {
    try {
      setLoading(true);
      const documentRef = doc(db, 'documents', selectedDocument.id);
      const approvalRequest = {
        ...values,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: 'currentUser', // Replace with actual user
        approvers: values.approvers.map(approverId => ({
          id: approverId,
          status: 'pending',
          comments: [],
        })),
      };

      await updateDoc(documentRef, {
        approvalRequest,
        status: 'pending',
        updatedAt: new Date().toISOString(),
      });

      message.success('Document submitted for approval');
      setIsModalVisible(false);
      form.resetFields();
      fetchDocuments();
    } catch (error) {
      console.error('Error submitting for approval:', error);
      message.error('Failed to submit for approval');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (values) => {
    try {
      setLoading(true);
      const documentRef = doc(db, 'documents', selectedDocument.id);
      const approvers = selectedDocument.approvalRequest.approvers.map(approver => {
        if (approver.id === 'currentUser') { // Replace with actual user
          return {
            ...approver,
            status: approvalStatus,
            comments: [...approver.comments, {
              text: values.comment,
              createdAt: new Date().toISOString(),
              createdBy: 'currentUser', // Replace with actual user
            }],
          };
        }
        return approver;
      });

      const isAllApproved = approvers.every(approver => approver.status === 'approved');
      const isAnyRejected = approvers.some(approver => approver.status === 'rejected');

      await updateDoc(documentRef, {
        'approvalRequest.approvers': approvers,
        status: isAllApproved ? 'approved' : isAnyRejected ? 'rejected' : 'pending',
        updatedAt: new Date().toISOString(),
      });

      message.success('Review submitted successfully');
      setIsReviewModalVisible(false);
      reviewForm.resetFields();
      fetchDocuments();
    } catch (error) {
      console.error('Error submitting review:', error);
      message.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentColumns = () => {
    return [
      {
        title: 'Document Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type) => (
          <Tag color={type === 'policy' ? 'blue' : type === 'procedure' ? 'green' : 'orange'}>
            {type}
          </Tag>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Tag color={status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning'}>
            {status}
          </Tag>
        ),
      },
      {
        title: 'Submitted By',
        dataIndex: ['approvalRequest', 'createdBy'],
        key: 'createdBy',
      },
      {
        title: 'Submitted At',
        dataIndex: ['approvalRequest', 'createdAt'],
        key: 'createdAt',
        render: (date) => dayjs(date).format('MMM DD, YYYY'),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button
              type="link"
              onClick={() => {
                setSelectedDocument(record);
                setIsReviewModalVisible(true);
              }}
            >
              Review
            </Button>
            <Button
              type="link"
              onClick={() => {
                setSelectedDocument(record);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Submit for Approval
            </Button>
          </Space>
        ),
      },
    ];
  };

  const getApprovalSteps = () => {
    if (!selectedDocument?.approvalRequest?.approvers) return [];

    return selectedDocument.approvalRequest.approvers.map(approver => {
      const employee = employees.find(e => e.id === approver.id);
      return {
        title: employee?.name || 'Unknown',
        status: approver.status === 'approved' ? 'finish' : 
                approver.status === 'rejected' ? 'error' : 'wait',
        icon: approver.status === 'approved' ? <CheckCircleOutlined /> :
              approver.status === 'rejected' ? <CloseCircleOutlined /> :
              <ClockCircleOutlined />,
      };
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Document Approval</h1>
      </div>

      <Table
        columns={getDocumentColumns()}
        dataSource={documents}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Submit for Approval"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitForApproval}
        >
          <Form.Item
            name="approvers"
            label="Approvers"
            rules={[{ required: true, message: 'Please select approvers' }]}
          >
            <Select mode="multiple" placeholder="Select approvers">
              {employees.map(employee => (
                <Option key={employee.id} value={employee.id}>
                  {employee.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Review Document"
        open={isReviewModalVisible}
        onCancel={() => {
          setIsReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        width={800}
        footer={null}
      >
        {selectedDocument && (
          <>
            <div className="mb-6">
              <Steps
                items={getApprovalSteps()}
                current={selectedDocument.approvalRequest?.approvers?.findIndex(
                  approver => approver.status === 'pending'
                )}
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Approval History</h3>
              <Timeline>
                {selectedDocument.approvalRequest?.approvers?.map(approver => {
                  const employee = employees.find(e => e.id === approver.id);
                  return approver.comments.map((comment, index) => (
                    <Timeline.Item
                      key={index}
                      color={approver.status === 'approved' ? 'green' : 
                             approver.status === 'rejected' ? 'red' : 'blue'}
                    >
                      <Comment
                        author={employee?.name || 'Unknown'}
                        avatar={<Avatar icon={<UserOutlined />} />}
                        content={comment.text}
                        datetime={dayjs(comment.createdAt).format('MMM DD, YYYY HH:mm')}
                      />
                    </Timeline.Item>
                  ));
                })}
              </Timeline>
            </div>

            <Form
              form={reviewForm}
              layout="vertical"
              onFinish={handleReview}
            >
              <Form.Item
                name="status"
                label="Decision"
                rules={[{ required: true, message: 'Please select a decision' }]}
              >
                <Select onChange={setApprovalStatus}>
                  <Option value="approved">Approve</Option>
                  <Option value="rejected">Reject</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="comment"
                label="Comments"
                rules={[{ required: true, message: 'Please enter comments' }]}
              >
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item>
                <div className="flex justify-end space-x-4">
                  <Button onClick={() => {
                    setIsReviewModalVisible(false);
                    reviewForm.resetFields();
                  }}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Submit Review
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default DocumentApproval; 