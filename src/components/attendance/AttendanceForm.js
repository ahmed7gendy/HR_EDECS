import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Select, DatePicker, TimePicker, message } from 'antd';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { Option } = Select;

const AttendanceForm = ({ isEdit }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    if (isEdit && id) {
      fetchAttendance();
    }
  }, [isEdit, id]);

  const fetchAttendance = async () => {
    try {
      const docRef = doc(db, 'attendances', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAttendance(data);
        form.setFieldsValue({
          ...data,
          date: data.date ? dayjs(data.date) : null,
          checkIn: data.checkIn ? dayjs(data.checkIn) : null,
          checkOut: data.checkOut ? dayjs(data.checkOut) : null,
        });
      }
    } catch (error) {
      message.error('Failed to fetch attendance details');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const attendanceData = {
        ...values,
        date: values.date.toDate(),
        checkIn: values.checkIn.toDate(),
        checkOut: values.checkOut.toDate(),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isEdit) {
        await updateDoc(doc(db, 'attendances', id), attendanceData);
        message.success('Attendance record updated successfully');
      } else {
        const docRef = doc(collection(db, 'attendances'));
        await setDoc(docRef, { ...attendanceData, id: docRef.id });
        message.success('Attendance record created successfully');
      }
      navigate('/attendance');
    } catch (error) {
      message.error('Failed to save attendance record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Attendance Record' : 'Create New Attendance Record'}
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: 'pending',
          attendanceType: 'regular',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select placeholder="Select employee">
              {/* Employee options will be populated from database */}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="checkIn"
            label="Check In Time"
            rules={[{ required: true, message: 'Please select check-in time' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="checkOut"
            label="Check Out Time"
            rules={[{ required: true, message: 'Please select check-out time' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="attendanceType"
            label="Attendance Type"
            rules={[{ required: true, message: 'Please select attendance type' }]}
          >
            <Select>
              <Option value="regular">Regular</Option>
              <Option value="overtime">Overtime</Option>
              <Option value="half_day">Half Day</Option>
              <Option value="remote">Remote</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
            className="md:col-span-2"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </div>

        <Form.Item>
          <div className="flex justify-end space-x-4">
            <Button onClick={() => navigate('/attendance')}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AttendanceForm; 