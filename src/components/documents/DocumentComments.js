import React, { useState, useEffect } from 'react';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { List, Button, Form, Input, Space, Avatar, Typography, Tooltip, Popconfirm } from 'antd';
import { SendOutlined, EditOutlined, DeleteOutlined, LikeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;
const { TextArea } = Input;

const DocumentComments = ({ documentId }) => {
  const { showSnackbar } = useSnackbar();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingComment, setEditingComment] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (documentId) {
      fetchComments();
    }
  }, [documentId]);

  const fetchComments = async () => {
    try {
      const commentsQuery = query(
        collection(db, 'documentComments'),
        where('documentId', '==', documentId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(commentsQuery);
      const commentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsList);
    } catch (error) {
      showSnackbar('error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (values) => {
    try {
      const newComment = {
        ...values,
        documentId,
        createdAt: new Date().toISOString(),
        createdBy: 'currentUser', // Replace with actual user
        likes: 0,
        likedBy: []
      };

      await addDoc(collection(db, 'documentComments'), newComment);
      showSnackbar('success', 'Comment added successfully');
      form.resetFields();
      fetchComments();
    } catch (error) {
      showSnackbar('error', 'Failed to add comment');
    }
  };

  const handleUpdateComment = async (values) => {
    try {
      await updateDoc(doc(db, 'documentComments', editingComment.id), {
        content: values.content,
        updatedAt: new Date().toISOString()
      });
      showSnackbar('success', 'Comment updated successfully');
      setEditingComment(null);
      form.resetFields();
      fetchComments();
    } catch (error) {
      showSnackbar('error', 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, 'documentComments', commentId));
      showSnackbar('success', 'Comment deleted successfully');
      fetchComments();
    } catch (error) {
      showSnackbar('error', 'Failed to delete comment');
    }
  };

  const handleLikeComment = async (comment) => {
    try {
      const updatedLikes = comment.likes + 1;
      const updatedLikedBy = [...comment.likedBy, 'currentUser']; // Replace with actual user

      await updateDoc(doc(db, 'documentComments', comment.id), {
        likes: updatedLikes,
        likedBy: updatedLikedBy
      });
      fetchComments();
    } catch (error) {
      showSnackbar('error', 'Failed to like comment');
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    form.setFieldsValue({
      content: comment.content
    });
  };

  return (
    <div>
      <Form
        form={form}
        onFinish={editingComment ? handleUpdateComment : handleAddComment}
        layout="vertical"
      >
        <Form.Item
          name="content"
          rules={[{ required: true, message: 'Please enter your comment!' }]}
        >
          <TextArea
            rows={4}
            placeholder="Add a comment..."
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
          >
            {editingComment ? 'Update Comment' : 'Add Comment'}
          </Button>
          {editingComment && (
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                setEditingComment(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
          )}
        </Form.Item>
      </Form>

      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={comment => (
          <List.Item
            actions={[
              <Space>
                <Tooltip title="Like">
                  <Button
                    type="text"
                    icon={<LikeOutlined />}
                    onClick={() => handleLikeComment(comment)}
                  >
                    {comment.likes}
                  </Button>
                </Tooltip>,
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditComment(comment)}
                  />
                </Tooltip>,
                <Popconfirm
                  title="Are you sure you want to delete this comment?"
                  onConfirm={() => handleDeleteComment(comment.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={comment.avatar} />}
              title={
                <Space>
                  <Text strong>{comment.createdBy}</Text>
                  <Text type="secondary">
                    {dayjs(comment.createdAt).fromNow()}
                  </Text>
                </Space>
              }
              description={comment.content}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default DocumentComments; 